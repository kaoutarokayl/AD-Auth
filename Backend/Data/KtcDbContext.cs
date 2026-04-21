using Microsoft.EntityFrameworkCore;
using KtcWeb.Models.Atm;

namespace KtcWeb.Data
{
    public class KtcDbContext : DbContext
    {
        public KtcDbContext(DbContextOptions<KtcDbContext> options) 
            : base(options)
        {
        }

        public DbSet<ClientAtmDto> Clients { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Client principal (keyless)
            modelBuilder.Entity<ClientAtmDto>()
                        .ToTable("Clients")
                        .HasNoKey();

            // Ignorer toutes les navigations pour éviter les erreurs de relationship
            modelBuilder.Entity<ClientAtmDto>()
                        .Ignore(c => c.Branch);

            modelBuilder.Entity<BranchDto>()
                        .HasNoKey()
                        .Ignore(b => b.Business)
                        .Ignore(b => b.Region);

            modelBuilder.Entity<BusinessDto>()
                        .HasNoKey();

            modelBuilder.Entity<RegionDto>()
                        .HasNoKey();
        }
    }
}