using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AzurenRole.Controllers
{
    public class TODOController : Controller
    {
        //
        // GET: /TODO/

        public ActionResult Index()
        {
            return View();
        }

    }
}
