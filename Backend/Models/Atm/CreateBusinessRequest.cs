namespace KtcWeb.Models.Atm
{
    public class CreateBusinessRequest
    {
        public string BusinessName { get; set; } = string.Empty;
        public string? DisplayId { get; set; }
    }
}