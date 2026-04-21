using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KtcWeb.Data;
using KtcWeb.Models.Atm;

namespace KtcWeb.Controllers
{
    [ApiController]
    [Route("api/atm")]
    public class AtmController : ControllerBase
    {
        private readonly KtcDbContext _context;

        public AtmController(KtcDbContext context)
        {
            _context = context;
        }

        // ====================== TEST CONNEXION ======================
        [HttpGet("test-connection")]
        public async Task<IActionResult> TestConnection()
        {
            try
            {
                bool canConnect = await _context.Database.CanConnectAsync();
                int count = await _context.Clients.CountAsync();

                return Ok(new
                {
                    status = "✅ Connexion réussie à KALKTCDB",
                    message = "La base est bien liée",
                    nombreDAtm = count,
                    database = "KALKTCDB"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = "❌ Erreur de connexion", error = ex.Message });
            }
        }

        // ====================== REGION ======================
        [HttpGet("regions")]
        public async Task<ActionResult<List<RegionDto>>> GetAllRegions()
        {
            try
            {
                var regions = await _context.Database.SqlQueryRaw<RegionDto>(@"
                    SELECT region_id AS RegionId, regionname AS RegionName, displayID AS DisplayId 
                    FROM dbo.Regions ORDER BY regionname").ToListAsync();

                return Ok(regions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("regions")]
        public async Task<IActionResult> CreateRegion([FromBody] CreateRegionRequest req)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO dbo.Regions (regionname, displayID) VALUES ({0}, {1})",
                    req.RegionName, req.DisplayId ?? (object)DBNull.Value);

                return Ok(new { message = "Région créée avec succès" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ====================== BUSINESS ======================
        [HttpGet("businesses")]
        public async Task<ActionResult<List<BusinessDto>>> GetAllBusinesses()
        {
            try
            {
                var businesses = await _context.Database.SqlQueryRaw<BusinessDto>(@"
                    SELECT business_id AS BusinessId, businessname AS BusinessName, displayID AS DisplayId 
                    FROM dbo.Businesses ORDER BY businessname").ToListAsync();

                return Ok(businesses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("businesses")]
        public async Task<IActionResult> CreateBusiness([FromBody] CreateBusinessRequest req)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(
                    "INSERT INTO dbo.Businesses (businessname, displayID) VALUES ({0}, {1})",
                    req.BusinessName, req.DisplayId ?? (object)DBNull.Value);

                return Ok(new { message = "Business créée avec succès" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ====================== BRANCH ======================
        [HttpGet("branches")]
        public async Task<ActionResult<List<BranchDto>>> GetAllBranches()
        {
            try
            {
                var branches = await _context.Database.SqlQueryRaw<BranchFlatDto>(@"
                    SELECT 
                        b.branch_id AS BranchId, 
                        b.branchname AS BranchName, 
                        ISNULL(b.displayID, '') AS DisplayId,
                        ISNULL(bus.business_id, 0) AS BusinessId,
                        ISNULL(bus.businessname, '') AS BusinessName,
                        ISNULL(bus.displayID, '') AS BusinessDisplayId,
                        ISNULL(r.region_id, 0) AS RegionId,
                        ISNULL(r.regionname, '') AS RegionName,
                        ISNULL(r.displayID, '') AS RegionDisplayId
                    FROM dbo.Branches b
                    LEFT JOIN dbo.Businesses bus ON b.business_id = bus.business_id
                    LEFT JOIN dbo.Regions r ON b.level1_region_id = r.region_id
                    ORDER BY r.regionname, bus.businessname, b.branchname")
                    .ToListAsync();

                var result = branches.Select(branch => new BranchDto
                {
                    BranchId = branch.BranchId,
                    BranchName = branch.BranchName,
                    DisplayId = branch.DisplayId,
                    Business = branch.BusinessId != 0 ? new BusinessDto
                    {
                        BusinessId = branch.BusinessId,
                        BusinessName = branch.BusinessName,
                        DisplayId = branch.BusinessDisplayId
                    } : null,
                    Region = branch.RegionId != 0 ? new RegionDto
                    {
                        RegionId = branch.RegionId,
                        RegionName = branch.RegionName,
                        DisplayId = branch.RegionDisplayId
                    } : null
                }).ToList();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private sealed class BranchFlatDto
        {
            public short BranchId { get; set; }
            public string BranchName { get; set; } = string.Empty;
            public string DisplayId { get; set; } = string.Empty;
            public short BusinessId { get; set; }
            public string BusinessName { get; set; } = string.Empty;
            public string BusinessDisplayId { get; set; } = string.Empty;
            public short RegionId { get; set; }
            public string RegionName { get; set; } = string.Empty;
            public string RegionDisplayId { get; set; } = string.Empty;
        }

        [HttpPost("branches")]
        public async Task<IActionResult> CreateBranch([FromBody] CreateBranchRequest req)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO dbo.Branches 
                        (branchname, displayID, business_id, level1_region_id)
                    VALUES 
                        ({0}, {1}, {2}, 
                            (SELECT TOP 1 level1_region_id 
                             FROM dbo.Businesses 
                             WHERE business_id = {2})
                        )",
                    req.BranchName,
                    req.DisplayId ?? (object)DBNull.Value,
                    req.BusinessId);

                return Ok(new { message = "Branche créée avec succès" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ====================== CLIENT / ATM ======================
        [HttpGet("clients")]
        public async Task<ActionResult<List<ClientAtmDto>>> GetAllClients()
        {
            try
            {
                var clients = await _context.Clients
                    .FromSqlRaw(@"
                        SELECT 
                            c.client_id AS ClientId,
                            c.ktcguid AS KtcGuid,
                            c.clientname AS ClientName,
                            c.networkaddress AS NetworkAddress,
                            CAST(c.connectable AS INT) AS Connectable,
                            c.comments AS Comments,

                            b.branch_id AS BranchId,
                            b.branchname AS BranchName,
                            ISNULL(b.displayID, '') AS BranchDisplayId,

                            bus.business_id AS BusinessId,
                            bus.businessname AS BusinessName,
                            ISNULL(bus.displayID, '') AS BusinessDisplayId,

                            r.region_id AS RegionId,
                            r.regionname AS RegionName,
                            ISNULL(r.displayID, '') AS RegionDisplayId
                        FROM dbo.Clients c
                        LEFT JOIN dbo.Branches b ON c.branch_id = b.branch_id
                        LEFT JOIN dbo.Businesses bus ON b.business_id = bus.business_id
                        LEFT JOIN dbo.Regions r ON b.level1_region_id = r.region_id
                        ORDER BY r.regionname, bus.businessname, b.branchname, c.clientname")
                    .ToListAsync();

                return Ok(clients);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("clients")]
        public async Task<IActionResult> CreateClient([FromBody] CreateOrUpdateAtmRequest req)
        {
            try
            {
                await _context.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO dbo.Clients 
                        (clientname, networkaddress, connectable, comments, branch_id, ktcguid)
                    VALUES 
                        (@clientName, @networkAddress, @connectable, @comments, @branchId, NEWID())",
                    new[]
                    {
                        new Microsoft.Data.SqlClient.SqlParameter("@clientName", req.ClientName),
                        new Microsoft.Data.SqlClient.SqlParameter("@networkAddress", req.NetworkAddress),
                        new Microsoft.Data.SqlClient.SqlParameter("@connectable", req.Connectable),
                        new Microsoft.Data.SqlClient.SqlParameter("@comments", (object?)req.Comments ?? DBNull.Value),
                        new Microsoft.Data.SqlClient.SqlParameter("@branchId", req.BranchId)
                    });

                return Ok(new { message = "ATM créé avec succès" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}