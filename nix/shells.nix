{ pkgs, packages, env, shellHook }:
with env;
{
  # development shell
  default = pkgs.mkShell {
    buildInputs = system ++ main ++ dev ++ lint;
    inherit shellHook;
  };
}
