using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzurenRole.OAuth
{
    public class ScopeUtils
    {
        public static IDictionary<string, string> scopes = new Dictionary<string, string>();

        static ScopeUtils()
        {
            scopes.Add("email", "Access you email address");
        }
    }
}