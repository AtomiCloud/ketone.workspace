import { Cyan, GlobType, IDeterminism, IInquirer, StartTemplateWithLambda } from '@atomicloud/cyan-sdk';

async function PromptDocker(
  i: IInquirer,
): Promise<[{ commit: boolean; release: boolean; platform: string }, string[]]> {
  const exclude: string[] = [];
  // prompt for docker
  const docker = {
    commit: false,
    platform: '',
    release: false,
  };
  const dc = await i.confirm('Enable Docker (y/n)', 'Enable Dockerfile and Docker CI');
  if (dc) {
    docker.commit = dc;
    // prompt for platform
    const dp = await i.checkbox('Docker Platforms', ['ARM', 'Intel'], 'Platform target platforms to target');
    docker.platform = dp.map(x => (x == 'ARM' ? 'linux/arm64' : 'linux/amd64')).join(',');

    // prompt for release
    const dr = await i.confirm(
      'Enable Docker Release (y/n)',
      'Enable script to retag Docker image when Semantic Release triggers',
    );
    docker.release = dr;
    if (!dr) {
      exclude.push('**/publish_docker.sh');
    }
  } else {
    exclude.push('**/Dockerfile');
    exclude.push('**/ci-docker.sh');
    exclude.push('**/publish_docker.sh');
  }
  return [docker, exclude];
}

async function PromptHelm(i: IInquirer): Promise<[{ commit: boolean; release: boolean }, string[]]> {
  const exclude: string[] = [];
  // prompt for docker
  const helm = {
    commit: false,
    release: false,
  };

  helm.commit = await i.confirm('Helm Chart Per Commit (y/n)', 'Publish a new helm chart with SHA & Branch per commit');
  helm.release = await i.confirm('Helm Chart On Release (y/n)', 'Publish a helm chart with Semantic Release');

  if (!helm.commit && !helm.release) exclude.push('**/publish_helm.sh');

  return [helm, exclude];
}

StartTemplateWithLambda(async (i: IInquirer, d: IDeterminism): Promise<Cyan> => {
  const rt = await i.select('Runtime', ['Bun', '.NET', 'Go'], 'The Runtime to setup for this workspace');
  const runtime = rt == 'Bun' ? 'bun' : rt == '.NET' ? 'dotnet' : 'go';

  const p = await i.text('Platform', 'LPSM Service Tree Platform');
  const s = await i.text('Service', 'LPSM Service Tree Service');

  const platform = p.toLowerCase();
  const service = s.toLowerCase();

  const [docker, dockerExclude] = await PromptDocker(i);
  const [helm, helmExclude] = await PromptHelm(i);

  const exclude = [...dockerExclude, ...helmExclude];

  const vars = { platform, service, runtime, docker, helm };

  return {
    processors: [
      {
        name: 'cyan/default',
        files: [
          {
            root: 'templates',
            glob: '**/*',
            type: GlobType.Template,
            exclude: exclude,
          },
        ],
        config: {
          vars,
          parser: {
            varSyntax: [
              ['let___', '___'],
              ['<%', '%>'],
            ],
          },
        },
      },
    ],
    plugins: [],
  } as Cyan;
});
