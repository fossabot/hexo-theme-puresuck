
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

function isEncryptPost(data) {
  if (!isEncryptInstalled) return false;
  let password = data.password;
  if (password === "") {
    return false;
  }
  if (hexo.config.encrypt === undefined) {
    hexo.config.encrypt = [];
  }

  if (('encrypt' in hexo.config) && ('tags' in hexo.config.encrypt)) {
    hexo.config.encrypt.tags.forEach((tagObj) => {
      tagEncryptPairs[tagObj.name] = tagObj.password;
    });
  }

  if (data.tags) {
    data.tags.forEach((cTag) => {
      if (tagEncryptPairs.hasOwnProperty(cTag.name)) {
        tagUsed = password ? tagUsed : cTag.name;
        password = password || tagEncryptPairs[cTag.name];
      }
    });
  }

  if (password == undefined) {
    return false;
  }
  return true;
}



hexo.extend.helper.register("isEncryptInstalled", function () {
  return isEncryptInstalled;
});
hexo.extend.helper.register("isEncryptPost", function (post) {
  return isEncryptPost(post);
});
