function checkPackage(PackageName) {
  try {
    require.resolve(PackageName);
    return true;
  } catch (e) {
    if (e.code == 'MODULE_NOT_FOUND') {
      return false;
    } else {
      console.log(e.code);
      return false;
    }
  }
}

const isEncryptInstalled = checkPackage('hexo-blog-encrypt');

if (isEncryptInstalled) {
  hexo.extend.helper.register("isEncryptInstalled", function () {
    return isEncryptInstalled;
  });
}