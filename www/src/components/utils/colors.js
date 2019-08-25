export const normalizeColor = (color, theme, required) => {
  const colorSpec = theme.global.colors[color] || color;
  // If the color has a light or dark object, use that
  let result = colorSpec;
  if (colorSpec) {
    if (theme.dark && colorSpec.dark) {
      result = colorSpec.dark;
    } else if (!theme.dark && colorSpec.light) {
      result = colorSpec.light;
    }
  }
  // allow one level of indirection in color names
  if (result && theme.global.colors[result]) {
    result = normalizeColor(result, theme);
  }
  return required && result === color ? 'inherit' : result;
};