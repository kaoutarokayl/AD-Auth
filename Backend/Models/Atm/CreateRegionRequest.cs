namespace KtcWeb.Models.Atm
{
    public class CreateRegionRequest
    {
        public string RegionName { get; set; } = string.Empty;
        public string? DisplayId { get; set; }
    }
}