{ pkgs, packages }:
with packages;
{
  system = [
    atomiutils
  ];

  dev = [
    pls
    git
    sg
  ];

  main = [
    infisical
    bun
  ];

  lint = [
    # core
    treefmt
    shellcheck
  ];
}
