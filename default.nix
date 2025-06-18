{
  lib,
  pkgs,
}: let
  yarn-berry = pkgs.yarn-berry_4;

  nodeDependencies = pkgs.stdenv.mkDerivation (finalAttrs: {
    pname = "sa-frontend";
    version = "0.0.0";

    offlineCache = yarn-berry.fetchYarnBerryDeps {
      inherit (finalAttrs) src missingHashes;
      hash = "sha256-AGLdrx08ELvOkEpMmTmM629laGIU90XLpv/yld8hXMY=";
    };
    missingHashes = ./missing-hashes.json;

    src = lib.fileset.toSource {
      root = ./.;
      fileset = lib.fileset.unions [
        # ./.yarn
        ./package.json
        ./yarn.lock
        ./.yarnrc.yml
      ];
    };

    nativeBuildInputs = with pkgs; [
      nodejs
      yarn-berry.yarnBerryConfigHook

      # Needed for node-gyp's building
      python3
      pkg-config
      pixman
      cairo
      pango.dev
    ];

    installPhase = ''
      runHook preInstall

      # Additional patchup
      chmod +w node_modules/sass-embedded-linux-x64/dart-sass/src/dart
      patchelf \
         --interpreter "$(cat $NIX_CC/nix-support/dynamic-linker)" \
        node_modules/sass-embedded-linux-x64/dart-sass/src/dart

      mkdir -p $out/
      cp -r node_modules $out/
      runHook postInstall
    '';
  });
in
  nodeDependencies
