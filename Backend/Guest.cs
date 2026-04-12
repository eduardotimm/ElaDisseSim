namespace ElaDisseSim.Api.Features.Rsvp;

public class Guest
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Nome do convidado específico
    public bool? IsConfirmed { get; set; } // Status de presença
    
    // Chave estrangeira ligando o convidado ao seu núcleo familiar
    public int FamilyId { get; set; }
    public Family? Family { get; set; }
}