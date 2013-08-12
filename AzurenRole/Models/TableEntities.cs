using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.WindowsAzure.Storage.Table;

namespace AzurenRole.Models
{
    public class RoomChatEntity : TableEntity
    {
        public string Content { get; set; }
        public int Author { get; set; }
        public DateTimeOffset Time { get; set; }
        public string RoomId { get; set; }
    }

    public class PersonalChatEntity : TableEntity
    {
        public string content { get; set; }
        public int Author { get; set; }
        public DateTimeOffset Time { get; set; }
        public int Target { get; set; }
    }

    public class PostForm
    {
        public string Content { get; set; }
    }
}