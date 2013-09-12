using System;
using System.Collections.Generic;
using System.Data.Objects;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Web.Mvc;
using AzurenRole.Utils;

namespace AzurenRole.Controllers
{
    public class CustomizeController : Controller
    {
        public JsonResult Index(int code = 0)
        {
            var customize = GlobalData.user.Customize;
            
            var theme = customize.Theme;
            if (code == 1) return Json(new { code = 1 }, JsonRequestBehavior.AllowGet);
            return Json(new
            {
                code = 0,
                data = new
                    {
                        Desktop = customize.Desktop,
                        Theme = new { Id = theme.Id, Name = theme.Name, Url = theme.Url },
                        Apps = customize.App.Split(',')
                    }
            }, JsonRequestBehavior.AllowGet);
        }

        public JsonResult SetTheme(int id)
        {
            try
            {
                GlobalData.user.Customize.ThemeId = id;
                GlobalData.dbContext.SaveChanges();
                GlobalData.dbContext.Refresh(RefreshMode.StoreWins, GlobalData.user);
                return Index(0);
            }
            catch (Exception ex)
            {
                return Index(1);
            }
        }

        public JsonResult SetDesktop(string url)
        {
            try
            {
                GlobalData.user.Customize.Desktop = url;
                GlobalData.dbContext.SaveChanges();
                GlobalData.dbContext.Refresh(RefreshMode.StoreWins, GlobalData.user);
                return Index(0);
            }
            catch (Exception ex)
            {
                return Index(1);
            }
        }
        public JsonResult AddDesktopIcon(string id)
        {
            try
            {
                List<string> apps = GlobalData.user.Customize.App.Split(',').Where(m=>m.Length>0).ToList();
                if (apps.Contains(id))
                {
                    throw new Exception("");
                }
                else
                {
                    apps.Add(id);
                    GlobalData.user.Customize.App =string.Join(",",apps);
                    GlobalData.dbContext.SaveChanges();
                    GlobalData.dbContext.Refresh(RefreshMode.StoreWins, GlobalData.user);
                    return Index(0);
                }
            }
            catch (Exception ex)
            {
                return Index(1);
            }
        }

        public JsonResult RemoveDesktopIcon(string id)
        {
            try
            {
                string[] apps = GlobalData.user.Customize.App.Split(',');
                if (!apps.Contains(id))
                {
                    throw new Exception("");
                }
                else
                {
                    GlobalData.user.Customize.App = string.Join(",", apps.Where(m=>m != id).ToList());
                    GlobalData.dbContext.SaveChanges();
                    GlobalData.dbContext.Refresh(RefreshMode.StoreWins, GlobalData.user);
                    return Index(0);
                }
            }
            catch (Exception ex)
            {
                return Index(1);
            }
        }
    }
}
