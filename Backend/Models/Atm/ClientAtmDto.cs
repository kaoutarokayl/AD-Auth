using System.ComponentModel.DataAnnotations.Schema;

namespace KtcWeb.Models.Atm
{
    public class ClientAtmDto
    {
        public int ClientId { get; set; }
        public string KtcGuid { get; set; } = string.Empty;
        public string ClientName { get; set; } = string.Empty;
        public string NetworkAddress { get; set; } = string.Empty;
        public int Connectable { get; set; }
        public string? Comments { get; set; }

        [NotMapped]
        public BranchDto? Branch { get; set; }   // contient Business + Region
    }
}