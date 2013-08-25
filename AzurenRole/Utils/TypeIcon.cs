using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AzurenRole.Utils
{
    public class TypeIcon
    {
        public static string ICON_DIR = "/Images/icons/filetypes/";
        public static string GetIcon(string mime)
        {
            string icon;
            if (mime.StartsWith("audio"))
            {
                icon = "audio-x-generic.png";
            }
            else if (mime.StartsWith("image"))
            {
                icon = "image-x-generic.png";
            }
            else if (mime.StartsWith("video"))
            {
                icon = "video-x-generic.png";
            }
            else if (mime.StartsWith("text"))
            {
                icon = "text-plain.png";
            }
            else
            {
                icon = "empty.png";
            }

            return ICON_DIR + icon;
        }
    }
}