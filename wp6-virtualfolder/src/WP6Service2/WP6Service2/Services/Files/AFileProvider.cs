﻿using System;
using System.Collections.Generic;
using System.IO;
using ServiceStack.Text;

namespace WP6Service2
{
    public abstract class AFileProvider
    {
        public abstract object GetFileList(string Path); //List<SBFile>
        public static string secretslocation = "/home/vagrant/.westlife/";
        public static String webdavroot = "/webdav/";

        private static string secretsprefix = "provider.";

        /** Default store to file in json */
        public void StoreToFile(ProviderItem request)
        {
            using (StreamWriter outputFile = new StreamWriter(secretslocation+secretsprefix+request.alias))
            {
                outputFile.WriteLine(request.ToJson());
            }
            ConfigStored(request);
        }

        /** Trigger action after storetofile, can be overriden by subclass */
        public virtual void ConfigStored(ProviderItem request)
        {

        }
        /** Default restore from alias */
        public ProviderItem RestoreAlias(String alias)
        {
            return RestoreFromFile(secretsprefix + alias);
        }

        /** Default restore from file */
        public static ProviderItem RestoreFromFile(String filename)
        {
            using (StreamReader outputFile = new StreamReader(secretslocation+filename))
            {
                var item = outputFile.ReadToEnd().FromJson<ProviderItem>();
                return item;
            }
        }

        /** Restore all from files */
        public static List<ProviderItem> GetAllConfigFiles()
        {
            var di = new DirectoryInfo(secretslocation);
            var fis = di.GetFileSystemInfos();
            var lp = new List<ProviderItem>();
            foreach (var fi in fis)
            {
                if (fi.Name.StartsWith(secretsprefix)) lp.Add(RestoreFromFile(fi.Name));
            }
            return lp;
        }

    }
}