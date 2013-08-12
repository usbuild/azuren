using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json.Serialization;

namespace AzurenRole.APIService
{
    public abstract class APIRouter
    {
        public abstract string Route(string[] args);
        public abstract string Symbol();

        public static string Error(string input)
        {
            return "<div class=\"sys-error-msg\">" + input + "</div>";
        }

        public static string Success(string input)
        {
            return "<div class=\"sys-success-msg\">" + input + "</div>";
        }
    }
}