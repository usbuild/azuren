using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;
using System.Web.Mvc;
using System.Web.Security;
using AzurenRole.Helpers;
using AzurenRole.OAuth;
using DotNetOpenAuth.Messaging;
using DotNetOpenAuth.OAuth2;

namespace AzurenRole.Controllers
{
    public class OAuth2Controller : Controller
    {
        class MyIdentity:IIdentity
        {
            public MyIdentity(string name, string type, bool isAuth)
            {
                this.Name = name;
                this.AuthenticationType = type;
                this.IsAuthenticated = isAuth;
            }
            public string Name { get; private set; }
            public string AuthenticationType { get; private set; }
            public bool IsAuthenticated { get; private set; }
        }

        private readonly AzurenEntities _entities = new AzurenEntities();


        [HttpGet]
        public ActionResult Authorize(string redirect_uri, string client_id, string scope = "", bool error = false)
        {
            ViewData["RedirectUri"] = redirect_uri;
            ViewData["ClientId"] = client_id;
            ViewData["Scope"] = scope.Split(' ').Select(m => m.Trim()).Where(m => m.Length > 0 && ScopeUtils.scopes.ContainsKey(m));
            ViewData["Client"] = _entities.OAppStores.SingleOrDefault(m => m.Id == client_id);
            ViewData["Error"] = error;
            return View();
        }


        [HttpPost, ValidateAntiForgeryToken]
        public async Task<ActionResult> Authorize(string username = null, string password = null)
        {
              
            if (username != null)
            {
                if (password != null)
                {
                    var entities = new AzurenEntities();
                    User u;
                    u = username.Contains("@") ? entities.Users.SingleOrDefault(m => m.Email == username) : entities.Users.SingleOrDefault(m => m.Username == username);
                    if (u == null || StringHelper.CalcPassword(password, u.Salt) != u.Password)
                    {
                        return RedirectToAction("Authorize", new { redirect_uri = Request.Params["redirect_uri"], client_id = Request.Params["client_id"], scope = Request.Params["scope"], error = true });
                    }
                    FormsAuthentication.SetAuthCookie(u.Username, true);
                    System.Web.HttpContext.Current.User = new RolePrincipal(new MyIdentity(u.Username, "Forms", true));
                }
            }
            if (!User.Identity.IsAuthenticated)
            {
                return Content("You must loggin first");
            }

            var authServer = new AuthorizationServer(new AuthorizationServerHost());
            var authRequest = await authServer.ReadAuthorizationRequestAsync(Request);
            var grantedResponse = authServer.PrepareApproveAuthorizationRequest(
                authRequest, this.User.Identity.Name, authRequest.Scope);
            IProtocolMessage responseMessage = grantedResponse;
            var response = await authServer.Channel.PrepareResponseAsync(responseMessage);
            return response.AsActionResult();
        }

        public async Task<ActionResult> Token()
        {
            var authServer = new AuthorizationServer(new AuthorizationServerHost());
            var t = await authServer.HandleTokenRequestAsync(Request);
            return t.AsActionResult();
        }

    }
}
