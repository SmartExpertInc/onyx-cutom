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

export const applyDefaultAvatarToSlides = (
  slides: any[],
  imageUrl?: string | null,
  altText?: string | null,
) => {
  if (!Array.isArray(slides) || !imageUrl) {
    return slides;
  }

  const options: AvatarInjectionOptions = {
    imageUrl,
    altText: altText || 'Avatar',
  };

  return slides.map((slide) => {
    if (!slide || typeof slide !== 'object') return slide;

    const updatedSlide = { ...slide };

    // Update top-level fields
    Object.keys(updatedSlide).forEach((key) => {
      if (key === 'props' || key === 'items' || key === 'metadata') return;
      const value = updatedSlide[key];
      if (shouldSetImage(key, value)) {
        updatedSlide[key] = imageUrl;
      } else if (shouldSetAlt(key, value) && options.altText) {
        updatedSlide[key] = options.altText;
      }
    });

    // Update props recursively
    if (updatedSlide.props) {
      updatedSlide.props = injectAvatarIntoValue(updatedSlide.props, options);
      if (!updatedSlide.props.defaultAvatarImage) {
        updatedSlide.props.defaultAvatarImage = imageUrl;
      }
      if (options.altText && !updatedSlide.props.defaultAvatarAlt) {
        updatedSlide.props.defaultAvatarAlt = options.altText;
      }
    }

    // Store at slide level as well
    if (!updatedSlide.defaultAvatarImage) {
      updatedSlide.defaultAvatarImage = imageUrl;
    }
    if (options.altText && !updatedSlide.defaultAvatarAlt) {
      updatedSlide.defaultAvatarAlt = options.altText;
    }

    return updatedSlide;
  });
};

