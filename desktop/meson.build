project(
    'snapshot-desktop',
    'c',
    version: '0.1.0',
    meson_version: '>=0.59.0',
    default_options: [
        'c_std=c11',
        'warning_level=2',
    ],
)

gtk = dependency('gtk4')
gtk_layer_shell = dependency('gtk4-layer-shell-0')

subdir('src')