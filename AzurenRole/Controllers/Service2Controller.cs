using System.Linq;
using System.Web.Http;
using AzurenRole.OAuth;

namespace AzurenRole.Controllers
{
    [OAuth2Service]
    public class Service2Controller : ApiController
    {
        private AzurenEntities entities = new AzurenEntities();

        [RequireScope("email")]
        public object Email()
        {
            User u = entities.Users.SingleOrDefault(m => m.Username == User.Identity.Name);
            return new {email = u.Email};
        }
    }
}
