using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Helpers;

namespace AzurenRole.SDK
{
    public class AzurenClient
    {
        //private static string OAuthServer = "http://127.0.0.1:81/OAuth";
        //private static string ApiServer = "http://127.0.0.1:81/Service";
        private static string OAuthServer = "http://azuren.chinacloudapp.cn/OAuth";
        private static string ApiServer = "http://azuren.chinacloudapp.cn/Service";
        private string AppId = "1";
        private string AppSecret = "111111";

        public AzurenClient(string appId, string appSecret)
        {
            this.AppId = appId;
            this.AppSecret = appSecret;
        }

        private dynamic HttpPost(string url, object data)
        {
            using (var client = new HttpClient())
            {
                var postData =
                    data.GetType()
                        .GetProperties()
                        .Select(prop =>
                            new KeyValuePair<string, string>(prop.Name, (prop.GetValue(data) is string) ?prop.GetValue(data).ToString():Json.Encode(prop.GetValue(data)))
                        )
                        .ToList();
                postData.Add(new KeyValuePair<string, string>("appId", this.AppId));
                postData.Add(new KeyValuePair<string, string>("secret", this.AppSecret));

                var response = client.PostAsync(url, new FormUrlEncodedContent(postData));
                if (response.Result.IsSuccessStatusCode)
                {
                    string content = response.Result.Content.ReadAsStringAsync().Result;
                    var obj = Json.Decode(content);
                    return obj;
                }
            }
            return null;
        }

        public string OAuthCheckUrl()
        {
            return OAuthServer + "/Check?appid=" + this.AppId;
        }

        public string GetToken(string key)
        {
            var d= HttpPost(OAuthServer + "/getToken", new {key=key});
            if (d.code == 0)
            {
                return d.data;
            }
                return null;
        }

        public bool SendMessage(string username, object message)
        {
            if (HttpPost(ApiServer + "/SendMessage", new
            {
                user=username,
                message=message
            }).code == 0)
            {
                return true;
            }
            return false;
        }
    }
}