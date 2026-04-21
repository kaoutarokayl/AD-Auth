namespace KtcWeb.Models.Atm
{
    public class CreateBranchRequest
    {
        public string BranchName { get; set; } = string.Empty;
        public string? DisplayId { get; set; }
        public short BusinessId { get; set; }      // changé en short
    }
}