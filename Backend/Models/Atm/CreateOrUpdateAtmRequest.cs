namespace KtcWeb.Models.Atm
{
    public class CreateOrUpdateAtmRequest
    {
        public string ClientName { get; set; } = string.Empty;
        public string NetworkAddress { get; set; } = string.Empty;
        public int Connectable { get; set; } = 1;
        public string? Comments { get; set; }
        public short BranchId { get; set; }        // changé en short
    }
}