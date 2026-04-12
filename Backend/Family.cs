namespace ElaDisseSim.Api.Features.Rsvp;

public class Family
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Ex: "Tia Maria", "Família Silva"
    public string PhoneNumber { get; set; } = string.Empty; // Telefone do chefe da família usado como login
    
    // Relacionamento: Um núcleo familiar (Family) tem vários acompanhantes/convidados (Guests)
    public ICollection<Guest> Guests { get; set; } = new List<Guest>();
}