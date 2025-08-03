import { type Cyan, GlobType, type IDeterminism, type IInquirer, StartTemplateWithLambda } from '@atomicloud/cyan-sdk';

async function PromptDocker(i: IInquirer): Promise<[boolean, string[]]> {
  const exclude: string[] = [];

  const docker = await i.confirm('Enable Docker (y/n)', 'atomi/workspace/enable-docker', 'Enable Docker Integration');
  if (!docker) {
    exclude.push('**/Dockerfile');
    exclude.push('**/docker.sh');
    exclude.push('**/⚡reusable-docker.yaml');
  }
  return [docker, exclude];
}

async function PromptHelm(i: IInquirer): Promise<[boolean, string[]]> {
  const exclude: string[] = [];

  const helm = await i.confirm('Enable Helm (y/n)', 'atomi/workspace/enable-helm', 'Enable Helm Chart Integration');

  if (!helm) {
    exclude.push('**/infra/root_chart/**/*');
    exclude.push('**/infra/root_chart/**/*.*');
    exclude.push('**/helm.sh');
    exclude.push('**/⚡reusable-helm.yaml');
  }
  return [helm, exclude];
}

StartTemplateWithLambda(async (i: IInquirer, d: IDeterminism): Promise<Cyan> => {
  const rt = await i.select(
    'Runtime',
    ['None', 'Bun', '.NET', 'Go'],
    'atomi/workspace/runtime',
    'The Runtime to setup for this workspace',
  );
  const runtime = rt === 'Bun' ? 'bun' : rt === '.NET' ? 'dotnet' : rt === 'Go' ? 'go' : 'none';

  const p = await i.text('Platform', 'atomi/workspace/platform', 'LPSM Service Tree Platform');
  const s = await i.text('Service', 'atomi/workspace/service', 'LPSM Service Tree Service');

  const platform = p.toLowerCase();
  const service = s.toLowerCase();

  const [docker, dockerExclude] = await PromptDocker(i);
  const [helm, helmExclude] = await PromptHelm(i);
  const exclude = [...dockerExclude, ...helmExclude];

  const secret = await i.confirm(
    'Enable Secret Management (y/n)',
    'atomi/workspace/enable-secret',
    'Enable Secret Management',
  );
  if (!secret) exclude.push('**/scripts/local/secrets.sh');

  const vars = { platform, service, runtime, docker, helm, secret };

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
