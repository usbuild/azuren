using System.Text.RegularExpressions;

namespace AzurenRole.Utils
{
    public class FilePath
    {
        private string _path;

        public FilePath(string path)
        {
            _path = BeautifyPath(path);
        }

        public bool IsRoot()
        {
            return this._path == "";
        }
        public static string BeautifyPath(string path)
        {
            string p = (new Regex(@"[/]{2,}", RegexOptions.None)).Replace(path, @"/");
            p = (new Regex(@"/\.", RegexOptions.None)).Replace(p, @"/");
            p = (new Regex(@"/\w+/\.\.", RegexOptions.None)).Replace(p, @"/");
            if (p.EndsWith("/")) p = p.Substring(0, p.Length - 1);
            return p;
        }

        public bool ContainsIn(string path)
        {
            return this._path.StartsWith(BeautifyPath(path));
        }

        public bool Contains(string path)
        {
            return BeautifyPath(path).StartsWith(_path);
        }

        public string Path()
        {
            return _path;
        }

        public string BasePath()
        {
            int pos = _path.LastIndexOf('/');
            if(pos == -1)
            return "";
                return _path.Substring(0, pos);
        }

        public string Name()
        {
            string[] segs = _path.Split('/');
            return segs[segs.Length - 1];
        }

        public string Join(string p)
        {
            return BeautifyPath(Path() + "/" + p);
        }
    }
}