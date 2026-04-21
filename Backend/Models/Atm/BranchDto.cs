using System.ComponentModel.DataAnnotations.Schema;

namespace KtcWeb.Models.Atm
{
    public class BranchDto
    {
        public short BranchId { get; set; }
        public string BranchName { get; set; } = string.Empty;
        public string DisplayId { get; set; } = string.Empty;
        [NotMapped]
        public BusinessDto? Business { get; set; }

        [NotMapped]
        public RegionDto? Region { get; set; }
    }
}