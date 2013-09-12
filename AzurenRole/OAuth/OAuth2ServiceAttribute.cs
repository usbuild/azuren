using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using DotNetOpenAuth.Messaging;
using DotNetOpenAuth.OAuth2;

namespace AzurenRole.OAuth
{
    public class OAuth2ServiceAttribute : ActionFilterAttribute, IActionFilter
    {
        public async Task<HttpResponseMessage> ExecuteActionFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
        {
            var scopeAttributes = actionContext.ActionDescriptor.GetCustomAttributes<RequireScopeAttribute>();
            var resourseServer =
                new ResourceServer(
                    new StandardAccessTokenAnalyzer(AuthorizationServerHost.HardCodedCryptoKeyStore))
                {
                    ScopeSatisfiedCheck = new ScopeSatisfiedCheck()
                };
            string[] scopes = { };
            if (scopeAttributes.Any())
            {
                scopes = scopeAttributes[0].Scopes;
            }
            try
            {
                var principal = await resourseServer.GetPrincipalAsync(actionContext.Request, cancellationToken, requiredScopes: scopes);
                HttpContext.Current.User = principal;
                Thread.CurrentPrincipal = principal;
            }
            catch (ProtocolFaultResponseException ex)
            {
                throw new HttpResponseException(HttpStatusCode.Unauthorized);
            }
            return await continuation();
        }

        private class ScopeSatisfiedCheck : IScopeSatisfiedCheck
        {
            public bool IsScopeSatisfied(HashSet<string> requiredScope, HashSet<string> grantedScope)
            {
                if (requiredScope.IsSubsetOf(grantedScope))
                {
                    return true;
                }
                return false;
            }
        }
    }
}