using System.Linq;
using System.Web.Http.Filters;

namespace AzurenRole.OAuth
{

    public class RequireScopeAttribute : ActionFilterAttribute
    {
        public string[] Scopes { set; get; }
        public RequireScopeAttribute(string scopes)
        {
            Scopes = scopes.Split(',').Select(m => m.Trim()).ToArray();
        }

        public RequireScopeAttribute(string[] scopes)
        {
            Scopes = scopes;
        }
    }
}