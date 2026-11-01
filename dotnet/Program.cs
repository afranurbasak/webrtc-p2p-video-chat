using System.Net.WebSockets;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseWebSockets();

var clients = new List<WebSocket>();
var clientsLock = new object();

app.Map("/ws", async context =>
{
    if (!context.WebSockets.IsWebSocketRequest)
    {
        context.Response.StatusCode = 400;
        return;
    }

    using var webSocket = await context.WebSockets.AcceptWebSocketAsync();

    lock (clientsLock)
    {
        clients.Add(webSocket);
        Console.WriteLine($"Yeni kullanıcı bağlandı. Toplam: {clients.Count}");
    }

    var buffer = new byte[8192];

    try
    {
        while (webSocket.State == WebSocketState.Open)
        {
            var ms = new MemoryStream();
            WebSocketReceiveResult result;

            do
            {
                result = await webSocket.ReceiveAsync(
                    new ArraySegment<byte>(buffer),
                    CancellationToken.None
                );

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await webSocket.CloseAsync(
                        WebSocketCloseStatus.NormalClosure,
                        "Bağlantı kapatıldı",
                        CancellationToken.None
                    );
                    break;
                }

                ms.Write(buffer, 0, result.Count);

            } while (!result.EndOfMessage);

            if (result.MessageType == WebSocketMessageType.Close)
                break;

            var messageBytes = ms.ToArray();
            var messageText = Encoding.UTF8.GetString(messageBytes);

            Console.WriteLine($"Mesaj geldi: {messageText}");

            List<WebSocket> otherClients;
            lock (clientsLock)
            {
                otherClients = clients
                    .Where(c => c != webSocket && c.State == WebSocketState.Open)
                    .ToList();
            }

            foreach (var client in otherClients)
            {
                await client.SendAsync(
                    new ArraySegment<byte>(messageBytes),
                    WebSocketMessageType.Text,
                    true,
                    CancellationToken.None
                );

                Console.WriteLine("Mesaj diğer kullanıcıya gönderildi");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Hata: {ex.Message}");
    }
    finally
    {
        lock (clientsLock)
        {
            clients.Remove(webSocket);
            Console.WriteLine($"Bir kullanıcı ayrıldı. Kalan: {clients.Count}");
        }
    }
});

app.Run("http://localhost:5000");
