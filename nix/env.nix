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
  ];

  lint = [
    # core
    treefmt
    shellcheck
  ];
}
