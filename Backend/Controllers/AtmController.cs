using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using KtcWeb.Data;
using KtcWeb.Models.Atm;
using System.Xml.Linq;

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

        [HttpGet("regions/{id}")]
        public async Task<ActionResult<RegionDetailsDto>> GetRegionById(short id)
        {
            try
            {
                var items = await _context.Database.SqlQueryRaw<RegionDetailsDto>(@"
                    SELECT
                        region_id AS RegionId,
                        regionname AS RegionName,
                        ISNULL(displayID, '') AS DisplayId,
                        business_id AS BusinessId,
                        region_level AS RegionLevel,
                        parent_region_id AS ParentRegionId,
                        CAST(additionalinfo AS nvarchar(max)) AS AdditionalInfo
                    FROM dbo.Regions
                    WHERE region_id = {0}", id).ToListAsync();

                var region = items.FirstOrDefault();
                if (region == null) return NotFound(new { message = "Région introuvable" });

                return Ok(region);
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
                var additionalInfoXml = BuildSimpleXml("PreConfigInfo", req.AdditionalInfo);

                await _context.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO dbo.Regions (displayID, regionname, business_id, region_level, parent_region_id, additionalinfo)
                    VALUES (@displayId, @regionName, @businessId, @regionLevel, @parentRegionId, CONVERT(xml, @additionalInfoXml))",
                    new[]
                    {
                        new Microsoft.Data.SqlClient.SqlParameter("@displayId", (object?)req.DisplayId ?? DBNull.Value),
                        new Microsoft.Data.SqlClient.SqlParameter("@regionName", req.RegionName),
                        new Microsoft.Data.SqlClient.SqlParameter("@businessId", req.BusinessId),
                        new Microsoft.Data.SqlClient.SqlParameter("@regionLevel", req.RegionLevel),
                        new Microsoft.Data.SqlClient.SqlParameter("@parentRegionId", req.ParentRegionId),
                        new Microsoft.Data.SqlClient.SqlParameter("@additionalInfoXml", additionalInfoXml),
                    });

                return Ok(new { message = "Région créée avec succès" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("regions/{id}")]
        public async Task<IActionResult> UpdateRegion(short id, [FromBody] UpdateRegionRequest req)
        {
            try
            {
                var additionalInfoXml = BuildSimpleXml("PreConfigInfo", req.AdditionalInfo);

                var rows = await _context.Database.ExecuteSqlRawAsync(@"
                    UPDATE dbo.Regions
                    SET displayID = @displayId,
                        regionname = @regionName,
                        business_id = @businessId,
                        region_level = @regionLevel,
                        parent_region_id = @parentRegionId,
                        additionalinfo = CONVERT(xml, @additionalInfoXml)
                    WHERE region_id = @id",
                    new[]
                    {
                        new Microsoft.Data.SqlClient.SqlParameter("@displayId", (object?)req.DisplayId ?? DBNull.Value),
                        new Microsoft.Data.SqlClient.SqlParameter("@regionName", req.RegionName),
                        new Microsoft.Data.SqlClient.SqlParameter("@businessId", req.BusinessId),
                        new Microsoft.Data.SqlClient.SqlParameter("@regionLevel", req.RegionLevel),
                        new Microsoft.Data.SqlClient.SqlParameter("@parentRegionId", req.ParentRegionId),
                        new Microsoft.Data.SqlClient.SqlParameter("@additionalInfoXml", additionalInfoXml),
                        new Microsoft.Data.SqlClient.SqlParameter("@id", id),
                    });

                if (rows == 0) return NotFound(new { message = "Région introuvable" });
                return Ok(new { message = "Région modifiée avec succès" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("regions/{id}")]
        public async Task<IActionResult> DeleteRegion(short id)
        {
            try
            {
                var rows = await _context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.Regions WHERE region_id = {0}", id);

                if (rows == 0) return NotFound(new { message = "Région introuvable" });
                return Ok(new { message = "Région supprimée avec succès" });
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

        [HttpGet("businesses/{id}")]
        public async Task<ActionResult<BusinessDetailsDto>> GetBusinessById(short id)
        {
            try
            {
                var items = await _context.Database.SqlQueryRaw<BusinessDetailsDto>(@"
                    SELECT 
                        business_id AS BusinessId,
                        businessname AS BusinessName,
                        ISNULL(displayID, '') AS DisplayId,
                        CAST(additionalinfo AS nvarchar(max)) AS AdditionalInfo
                    FROM dbo.Businesses
                    WHERE business_id = {0}", id).ToListAsync();

                var business = items.FirstOrDefault();
                if (business == null) return NotFound(new { message = "Business introuvable" });

                return Ok(business);
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
                var additionalInfoXml = BuildSimpleXml("PreConfigInfo", req.AdditionalInfo);

                await _context.Database.ExecuteSqlRawAsync(@"
                    INSERT INTO dbo.Businesses (businessname, displayID, additionalinfo) 
                    VALUES (@businessName, @displayId, CONVERT(xml, @additionalInfoXml))",
                    new[]
                    {
                        new Microsoft.Data.SqlClient.SqlParameter("@businessName", req.BusinessName),
                        new Microsoft.Data.SqlClient.SqlParameter("@displayId", (object?)req.DisplayId ?? DBNull.Value),
                        new Microsoft.Data.SqlClient.SqlParameter("@additionalInfoXml", additionalInfoXml)
                    });

                return Ok(new { message = "Business créée avec succès" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("businesses/{id}")]
        public async Task<IActionResult> UpdateBusiness(short id, [FromBody] UpdateBusinessRequest req)
        {
            try
            {
                var additionalInfoXml = BuildSimpleXml("PreConfigInfo", req.AdditionalInfo);

                var rows = await _context.Database.ExecuteSqlRawAsync(@"
                    UPDATE dbo.Businesses
                    SET businessname = @businessName,
                        displayID = @displayId,
                        additionalinfo = CONVERT(xml, @additionalInfoXml)
                    WHERE business_id = @id",
                    new[]
                    {
                        new Microsoft.Data.SqlClient.SqlParameter("@businessName", req.BusinessName),
                        new Microsoft.Data.SqlClient.SqlParameter("@displayId", (object?)req.DisplayId ?? DBNull.Value),
                        new Microsoft.Data.SqlClient.SqlParameter("@additionalInfoXml", additionalInfoXml),
                        new Microsoft.Data.SqlClient.SqlParameter("@id", id)
                    });

                if (rows == 0) return NotFound(new { message = "Business introuvable" });
                return Ok(new { message = "Business modifiée avec succès" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("businesses/{id}")]
        public async Task<IActionResult> DeleteBusiness(short id)
        {
            try
            {
                var rows = await _context.Database.ExecuteSqlRawAsync(
                    "DELETE FROM dbo.Businesses WHERE business_id = {0}", id);

                if (rows == 0) return NotFound(new { message = "Business introuvable" });
                return Ok(new { message = "Business supprimée avec succès" });
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

        private static string BuildSimpleXml(string rootName, string? freeText)
        {
            // Si on reçoit déjà une string XML valide, on l'accepte tel quel.
            if (!string.IsNullOrWhiteSpace(freeText))
            {
                var trimmed = freeText.Trim();
                if (trimmed.StartsWith("<") && trimmed.EndsWith(">"))
                {
                    try
                    {
                        _ = XDocument.Parse(trimmed);
                        return trimmed;
                    }
                    catch
                    {
                        // fallback: encapsulation
                    }
                }
            }

            var doc = new XDocument(
                new XElement(rootName,
                    string.IsNullOrWhiteSpace(freeText) ? null : new XElement("note", freeText.Trim())
                )
            );

            return doc.ToString(SaveOptions.DisableFormatting);
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