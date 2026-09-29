import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import FastImage from '@d11/react-native-fast-image';
import { AppImage, preloadImages } from '@shared/components/ui/AppImage';

describe('AppImage', () => {
  it('renders the fallback when there is no uri', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AppImage uri={null} fallback={<Text>SEM_IMAGEM</Text>} />
      );
    });

    const texts = renderer!.root
      .findAllByType(Text)
      .map((node) => node.props.children);
    expect(texts).toContain('SEM_IMAGEM');

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('renders the image when a uri is provided', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AppImage uri="https://cdn.example.com/p.jpg" testID="app-image" />
      );
    });

    expect(renderer!.root.findAllByProps({ testID: 'app-image' }).length).toBeGreaterThan(0);

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('shows the fallback when the image errors', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AppImage
          uri="https://cdn.example.com/broken.jpg"
          testID="broken-image"
          fallback={<Text>ERRO_IMAGEM</Text>}
        />
      );
    });

    const image = renderer!.root.findAll(
      (node) => typeof node.props?.onError === 'function'
    )[0];
    ReactTestRenderer.act(() => {
      image.props.onError();
    });

    const texts = renderer!.root
      .findAllByType(Text)
      .map((node) => node.props.children);
    expect(texts).toContain('ERRO_IMAGEM');

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('resets to loading when the uri changes', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AppImage uri="https://cdn.example.com/a.jpg" testID="img-a" />
      );
    });

    const firstImage = renderer!.root.findAll(
      (node) => typeof node.props?.onLoad === 'function'
    )[0];
    ReactTestRenderer.act(() => {
      firstImage.props.onLoad();
    });

    ReactTestRenderer.act(() => {
      renderer!.update(
        <AppImage uri="https://cdn.example.com/b.jpg" testID="img-b" />
      );
    });

    // The new image is rendered (fresh key) and not stuck on a stale status
    expect(
      renderer!.root.findAllByProps({ testID: 'img-b' }).length
    ).toBeGreaterThan(0);

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('does not paint the previous error fallback after the uri changes', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <AppImage
          uri="https://cdn.example.com/broken.jpg"
          testID="img"
          fallback={<Text>ERRO_IMAGEM</Text>}
        />
      );
    });

    const first = renderer!.root.findAll(
      (node) => typeof node.props?.onError === 'function'
    )[0];
    ReactTestRenderer.act(() => {
      first.props.onError();
    });
    expect(
      renderer!.root.findAllByType(Text).map((n) => n.props.children)
    ).toContain('ERRO_IMAGEM');

    // Swap to a valid uri in the same component instance (cell reuse)
    ReactTestRenderer.act(() => {
      renderer!.update(
        <AppImage
          uri="https://cdn.example.com/ok.jpg"
          testID="img-ok"
          fallback={<Text>ERRO_IMAGEM</Text>}
        />
      );
    });

    const texts = renderer!.root
      .findAllByType(Text)
      .map((n) => n.props.children);
    expect(texts).not.toContain('ERRO_IMAGEM');
    expect(
      renderer!.root.findAllByProps({ testID: 'img-ok' }).length
    ).toBeGreaterThan(0);

    ReactTestRenderer.act(() => {
      renderer?.unmount();
    });
  });

  it('preloadImages forwards only valid uris to FastImage', () => {
    (FastImage.preload as jest.Mock).mockClear();

    preloadImages([
      'https://cdn.example.com/a.jpg',
      null,
      undefined,
      'https://cdn.example.com/b.jpg',
    ]);

    expect(FastImage.preload).toHaveBeenCalledWith([
      { uri: 'https://cdn.example.com/a.jpg' },
      { uri: 'https://cdn.example.com/b.jpg' },
    ]);
  });

  it('preloadImages does nothing when there are no uris', () => {
    (FastImage.preload as jest.Mock).mockClear();
    preloadImages([null, undefined]);
    expect(FastImage.preload).not.toHaveBeenCalled();
  });
});
