﻿using System.Web.Mvc;

namespace AzurenRole.Controllers
{
    public class WidgetController : Controller
    {
        //
        // GET: /Widget/

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Clock()
        {
            return View();
        }

        public ActionResult Weather()
        {
            return View();
        }

    }
}
