{ pkgs, packages }:
with packages;
{
  system = [
    atomiutils
  ];

  dev = [
    pls
    git
  ];

  main = [
    infisical
    bun
    cyanprint
  ];

  lint = [
    # core
    treefmt
    shellcheck
    sg
  ];

  releaser = [
    sg
  ];
}
