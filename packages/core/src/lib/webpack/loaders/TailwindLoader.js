const fs = require('fs');
const { join, normalize } = require('path');
const { CONSTANTS } = require('../../helpers');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

/* eslint-disable no-multi-assign */
/* eslint-disable global-require */
module.exports = exports = function TailwindLoader(c) {
  if (this.mode === 'production') {
    if (this.resourcePath.includes('tailwind.scss')) {
      return `/*beginTailwind*/${c}/*endTailwind*/`;
    } else {
      return c;
    }
  }
  const components = (this.getOptions().getComponents)();
  const route = this.getOptions().route;
  let list = [];
  components.forEach((module) => {
    this.addDependency(module);
  });

  // const modules = this._compilation._modules;
  // modules.forEach((file) => {
  //   // Check if the file is js file, and exclude all from node_modules except @evershop/core
  //   if (file.resource &&
  //     file.resource.includes('.js') &&
  //     !file.resource.includes('node_modules') ||
  //     file.resource.includes(normalize('@evershop/core'))) {
  //     // Get the path of the file
  //     let filePath = file.resource;
  //     // Add file to the list of tailwind content
  //     list.push(filePath);
  //   }
  // });

  // list.forEach((module) => {
  //   this.addDependency(module);
  // });

  // Use PostCss to parse tailwind.css with tailwind config

  const defaultTailwindConfig = route.isAdmin ?
    require('@evershop/core/src/modules/cms/services/tailwind.admin.config.js') :
    require('@evershop/core/src/modules/cms/services/tailwind.frontStore.config.js');

  let tailwindConfig = {};
  if (route.isAdmin) {
    if (fs.existsSync(join(CONSTANTS.ROOTPATH, 'tailwind.admin.config.js'))) {
      tailwindConfig = require(join(CONSTANTS.ROOTPATH, 'tailwind.admin.config.js'));
    }
  } else {
    if (fs.existsSync(join(CONSTANTS.ROOTPATH, 'tailwind.frontStore.config.js'))) {
      tailwindConfig = require(join(CONSTANTS.ROOTPATH, 'tailwind.frontStore.config.js'));
    }

  }
  // Merge defaultTailwindConfig with tailwindConfigJs
  const mergedTailwindConfig = Object.assign(defaultTailwindConfig, tailwindConfig);
  // get list of modules that are used in the webpack build

  mergedTailwindConfig.content = [
    // All file in extensions folder and name is capitalized
    join(CONSTANTS.ROOTPATH, 'extensions', '**', '[A-Z]*.js'),
    // All file in packages/core/src and name is capitalized
    join(CONSTANTS.ROOTPATH, 'packages', 'core', 'src', '**', '[A-Z]*.js'),
    // All file in node_modules/@evershop/core/src and name is capitalized
    join(CONSTANTS.ROOTPATH, 'node_modules', '@evershop', 'core', 'src', '**', '[A-Z]*.js'),
    // All file in themes folder and name is capitalized
    join(CONSTANTS.ROOTPATH, 'themes', '**', '[A-Z]*.js'),
  ];
  // Postcss with tailwind plugin
  try {
    const tailwindCssResult = postcss([tailwindcss(mergedTailwindConfig), autoprefixer]).process(c);
    // get the css from the result
    const tailwindCss = tailwindCssResult.css;
    return tailwindCss;
  } catch (error) {
    throw new Error(error);
  }
};

