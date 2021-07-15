function stringify(obj) {
  return Object.keys(obj).reduce((ret, key) => {
    const prefix = ret ? `${ret}, ` : '';
    return `${prefix}[${key}]${obj[key]}`;
  }, '');
}

export function createApiFormatter(oldFormatter) {
  return function apiFormatter(rawData) {
    if (!rawData.data) {
      return {
        data: null,
        success: false,
        message: rawData.errors.map(error => error.message).join(','),
        code: rawData.code,
        errors: rawData.errors
      };
    }

    let newData;
    const keys = Object.keys(rawData.data);
    if (keys.length === 1) {
      if (rawData.success) {
        newData = {
          ...rawData.data[keys[0]],
          success: true,
          message: null,
          code: null
        };
      } else {
        newData = {
          ...(rawData.data[keys[0]] || { data: null }),
          success: false,
          message: rawData.errors[0].message
        };
        if (rawData.errors[0].extensions) {
          const extensions = rawData.errors[0].extensions;
          newData.code = extensions.code;
          newData.errors = extensions.errors;
        }
      }

      return oldFormatter ? oldFormatter(newData) : newData;
    }

    if (rawData.success) {
      newData = {
        data: rawData.data,
        success: true,
        message: null,
        code: null
      };
    } else {
      const errors = {};
      const message = {};
      const code = {};

      keys.forEach(key => {
        const error = rawData.errors.find(error => (error.path[0] === key));
        if (error) {
          errors[key] = {
            message: error.message
          };
          message[key] = error.message;

          if (error.extensions) {
            errors[key].code = error.extensions.code;
            errors[key].errors = error.extensions.errors;
            code[key] = error.extensions.code;
          }
        }
      });

      newData = {
        data: rawData.data,
        success: false,
        errors,
        message: stringify(message),
        code: stringify(code)
      };
    }

    if (oldFormatter && typeof oldFormatter !== 'object') {
      throw new Error('[Service Ark] 请求后端多个数据时，formatter 参数值应为 object 类型，key 为数据源名，如 { hsfA: formatter(...), hsfB: formatter(...) }');
    }

    Object.keys(newData.data).forEach(key => {
      if (newData.data[key]) {
        if (oldFormatter && (key in oldFormatter)) {
          newData.data[key] = oldFormatter[key](newData.data[key]).data;
        } else {
          newData.data[key] = newData.data[key].data;
        }
      }
    });

    return newData;
  };
}
