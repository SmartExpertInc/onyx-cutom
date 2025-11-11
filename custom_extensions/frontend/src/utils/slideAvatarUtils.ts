export interface AvatarInjectionOptions {
  imageUrl: string | null | undefined;
  altText?: string | null;
}

const IMAGE_KEY_REGEX = /(avatar|profile|actor).*image.*path$/i;
const ALT_KEY_REGEX = /(avatar|profile|actor).*image.*alt$/i;

const shouldSetImage = (key: string, value: unknown): boolean => {
  if (!IMAGE_KEY_REGEX.test(key)) return false;
  return value === undefined || value === null || value === '';
};

const shouldSetAlt = (key: string, value: unknown): boolean => {
  if (!ALT_KEY_REGEX.test(key)) return false;
  return value === undefined || value === null || value === '';
};

const injectAvatarIntoValue = (value: any, options: AvatarInjectionOptions): any => {
  const { imageUrl, altText } = options;
  if (!imageUrl) return value;

  if (Array.isArray(value)) {
    let changed = false;
    const result = value.map((item) => {
      const next = injectAvatarIntoValue(item, options);
      if (next !== item) changed = true;
      return next;
    });
    return changed ? result : value;
  }

  if (value && typeof value === 'object') {
    let changed = false;
    const result: Record<string, any> = Array.isArray(value) ? [...value] : { ...value };

    Object.entries(result).forEach(([key, current]) => {
      if (current && typeof current === 'object') {
        const next = injectAvatarIntoValue(current, options);
        if (next !== current) {
          result[key] = next;
          changed = true;
        }
      } else if (shouldSetImage(key, current)) {
        result[key] = imageUrl;
        changed = true;
      } else if (shouldSetAlt(key, current) && altText) {
        result[key] = altText;
        changed = true;
      }
    });

    return changed ? result : value;
  }

  return value;
};

const applyDefaultAvatarToObject = <T extends Record<string, any>>(
  target: T,
  options: AvatarInjectionOptions,
): T => {
  if (!options.imageUrl) return target;

  const next: Record<string, any> = { ...target };

  Object.keys(next).forEach((key) => {
    const value = next[key];
    if (key === 'props' || key === 'items' || key === 'metadata') {
      return;
    }

    if (shouldSetImage(key, value)) {
      next[key] = options.imageUrl;
    } else if (shouldSetAlt(key, value) && options.altText) {
      next[key] = options.altText;
    }
  });

  return next as T;
};

export const applyDefaultAvatarToProps = <T extends Record<string, any>>(
  props: T,
  imageUrl?: string | null,
  altText?: string | null,
): T => {
  if (!props || typeof props !== 'object') return props;

  const options: AvatarInjectionOptions = {
    imageUrl: imageUrl ?? undefined,
    altText: altText ?? undefined,
  };

  const propsWithTopLevel = applyDefaultAvatarToObject(props, options);
  const injectedProps = injectAvatarIntoValue(propsWithTopLevel, options);

  if (options.imageUrl && typeof injectedProps === 'object' && injectedProps) {
    if (!('defaultAvatarImage' in injectedProps) || !injectedProps.defaultAvatarImage) {
      injectedProps.defaultAvatarImage = options.imageUrl;
    }
    if (options.altText && (!('defaultAvatarAlt' in injectedProps) || !injectedProps.defaultAvatarAlt)) {
      injectedProps.defaultAvatarAlt = options.altText;
    }
  }

  return injectedProps;
};

export const applyDefaultAvatarToSlides = (
  slides: any[],
  imageUrl?: string | null,
  altText?: string | null,
) => {
  if (!Array.isArray(slides)) {
    return slides;
  }

  return slides.map((slide) => {
    if (!slide || typeof slide !== 'object') return slide;

    const options: AvatarInjectionOptions = {
      imageUrl: imageUrl ?? slide.defaultAvatarImage,
      altText: altText ?? slide.defaultAvatarAlt ?? 'Avatar',
    };

    const updatedSlide = applyDefaultAvatarToObject(slide, options);

    if (updatedSlide.props) {
      updatedSlide.props = applyDefaultAvatarToProps(updatedSlide.props, options.imageUrl, options.altText);
    }

    if (options.imageUrl && (!updatedSlide.defaultAvatarImage || updatedSlide.defaultAvatarImage === '')) {
      updatedSlide.defaultAvatarImage = options.imageUrl;
    }
    if (options.altText && (!updatedSlide.defaultAvatarAlt || updatedSlide.defaultAvatarAlt === '')) {
      updatedSlide.defaultAvatarAlt = options.altText;
    }

    return updatedSlide;
  });
};

