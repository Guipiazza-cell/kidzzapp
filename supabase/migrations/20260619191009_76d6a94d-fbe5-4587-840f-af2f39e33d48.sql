
-- =====================================================
-- ACTIVITIES
-- =====================================================
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  emoji text not null,
  titulo text not null,
  gancho text,
  categoria text not null,
  energia text,
  tempo text,
  duracao_min int,
  contexto text,
  tela_min int,
  materiais jsonb default '[]'::jsonb,
  passos jsonb default '[]'::jsonb,
  curiosidade text,
  origem text default 'seed',
  created_at timestamptz default now()
);

grant select on public.activities to anon, authenticated;
grant all on public.activities to service_role;

alter table public.activities enable row level security;
drop policy if exists "leitura publica" on public.activities;
create policy "leitura publica" on public.activities for select using (true);

-- limpa seeds anteriores antes de repopular
delete from public.activities where origem = 'seed';

insert into public.activities (emoji, titulo, gancho, categoria, energia, tempo, duracao_min, contexto, tela_min, materiais, passos, curiosidade) values
('🥛','Leite Mágico','Parece mágica, mas é ciência pura. As cores dançam sozinhas no prato.','ciencia','curiosa','15 min',15,'Em casa',25,
 '["Prato fundo","Leite","Corante alimentício","Detergente","Cotonete"]'::jsonb,
 '["Despeje o leite num prato fundo.","Pingue gotas de corante de cores diferentes.","Encoste o cotonete no detergente.","Toque no centro do leite e veja as cores correrem."]'::jsonb,
 'O detergente quebra a tensão do leite, e as cores se espalham fugindo dele.'),
('🌋','Vulcão de Cores','Uma erupção colorida que transborda da bancada.','ciencia','agitada','15 min',15,'Em casa',25,
 '["Bicarbonato","Vinagre","Corante","Detergente"]'::jsonb,
 '["Coloque bicarbonato num recipiente.","Pingue corante e um pouco de detergente.","Despeje o vinagre.","Veja o vulcão entrar em erupção."]'::jsonb,
 'O vinagre reage com o bicarbonato e solta gás. A espuma é esse gás escapando.'),
('🌈','Arco-íris no Copo','Camadas de cor que não se misturam, como num passe de mágica.','ciencia','curiosa','20 min',20,'Em casa',30,
 '["Copo","Açúcar","Água morna","Corantes"]'::jsonb,
 '["Faça misturas com quantidades diferentes de açúcar.","Adicione um corante em cada uma.","Despeje devagar, da mais doce pra menos doce.","Veja as camadas se formarem sem misturar."]'::jsonb,
 'Densidades diferentes não se misturam: cada camada tem mais ou menos açúcar.'),
('🔦','Mensagem Secreta','Escreva invisível e revele com a luz. Puro suspense.','ciencia','curiosa','10 min',10,'Em casa',20,
 '["Papel","Suco de limão","Cotonete","Luz quente"]'::jsonb,
 '["Escreva no papel com suco de limão e um cotonete.","Deixe secar. A mensagem some.","Aqueça perto de uma luz, com um adulto.","Veja a mensagem secreta aparecer."]'::jsonb,
 'O limão escurece mais rápido que o papel quando esquenta, revelando a escrita.'),
('🥚','Ovo Saltitante','Ele pula e parece mágica, mas é ciência de verdade.','ciencia','curiosa','10 min + espera',10,'Em casa',20,
 '["Ovo cru","Copo","Vinagre branco"]'::jsonb,
 '["Coloque o ovo cru num copo com vinagre.","Deixe de molho por 24 a 48 horas.","Retire e enxágue com cuidado.","O ovo fica elástico e quica de leve."]'::jsonb,
 'O vinagre dissolve a casca e sobra só a membrana, deixando o ovo borrachudo.'),
('🌀','Tornado no Pote','Gire o pote e um redemoinho aparece lá dentro.','ciencia','curiosa','10 min',10,'Em casa',20,
 '["Pote com tampa","Água","Corante","Glitter"]'::jsonb,
 '["Encha o pote quase todo com água.","Pingue corante e um pouco de glitter.","Feche bem a tampa.","Gire em círculos e observe o tornado."]'::jsonb,
 'O giro empurra a água pras bordas e cria um funil no meio, como num tornado.'),
('🫧','Lâmpada de Lava no Copo','Bolhas coloridas que sobem e descem sem parar.','ciencia','curiosa','10 min',10,'Em casa',20,
 '["Copo","Óleo","Água","Corante","Comprimido efervescente"]'::jsonb,
 '["Coloque água até a metade do copo.","Complete com óleo.","Pingue gotas de corante.","Adicione o comprimido e veja as bolhas dançarem."]'::jsonb,
 'O comprimido cria bolhas de gás que sobem levando cor e descem quando o gás escapa.'),
('🎈','Balão que Enche Sozinho','Sem assoprar: o balão infla como num passe de mágica.','ciencia','curiosa','10 min',10,'Em casa',20,
 '["Garrafa pet","Balão","Bicarbonato","Vinagre"]'::jsonb,
 '["Coloque vinagre na garrafa.","Ponha bicarbonato dentro do balão.","Encaixe o balão na boca da garrafa.","Levante o balão e veja ele encher."]'::jsonb,
 'O bicarbonato e o vinagre soltam gás, e esse gás enche o balão sozinho.'),

('🐚','Caixa Sensorial do Mar','Explore as texturas do fundo do oceano com as mãos.','sensorial','cansada','20 min',20,'Em casa',35,
 '["Caixa","Arroz","Conchas","Animais de brinquedo"]'::jsonb,
 '["Coloque o arroz na caixa como areia.","Espalhe conchas pelo fundo.","Adicione os animais marinhos.","Deixe explorar, sentir e inventar histórias."]'::jsonb,
 'Sentir texturas diferentes acalma e estimula os sentidos.'),
('🏖️','Areia Mágica','Modela como areia molhada e se desmancha ao soltar.','sensorial','cansada','15 min',15,'Em casa',30,
 '["Areia","Amido de milho","Água"]'::jsonb,
 '["Misture areia e amido de milho.","Adicione água aos poucos.","Misture com as mãos até dar liga.","Modele castelos que se desmancham."]'::jsonb,
 'A areia fica unida quando apertada e se solta quando relaxamos.'),
('🎨','Massinha de Sal','Macia, caseira e econômica. Pura terapia pras mãos.','sensorial','cansada','15 min',15,'Em casa',30,
 '["Farinha","Sal","Água","Óleo","Corante"]'::jsonb,
 '["Misture farinha e sal.","Adicione água e óleo aos poucos.","Sove até ficar homogêneo.","Divida e pinte com corante."]'::jsonb,
 'O sal ajuda a massa a durar mais, e amassar acalma e alivia tensões.'),
('❄️','Neve Artificial','Macia, gelada e divertida. Neve em casa, sem frio.','sensorial','cansada','10 min',10,'Em casa',20,
 '["Bicarbonato","Espuma de barbear"]'::jsonb,
 '["Coloque bicarbonato numa tigela.","Adicione espuma de barbear aos poucos.","Misture com as mãos.","Brinque com a neve fofinha."]'::jsonb,
 'A espuma com o bicarbonato vira uma massa leve e fria que parece neve.'),
('🫙','Pote da Calma','Agite, observe e respire enquanto o brilho desce devagar.','sensorial','cansada','10 min',10,'Em casa',20,
 '["Pote com tampa","Água","Cola transparente","Glitter"]'::jsonb,
 '["Encha o pote até a metade com água.","Adicione cola transparente e glitter.","Feche bem e agite.","Observe as partículas descerem respirando fundo."]'::jsonb,
 'Acompanhar algo que desce devagar ajuda o cérebro a desacelerar.'),
('🌌','Galáxia no Pote','Um universo inteiro que cabe na palma da mão.','sensorial','cansada','10 min',10,'Em casa',20,
 '["Pote","Água","Corante","Glitter"]'::jsonb,
 '["Coloque água no pote.","Pingue corante roxo e azul.","Adicione bastante glitter.","Misture e veja uma galáxia surgir."]'::jsonb,
 'As cores escuras com o glitter imitam estrelas e nebulosas de uma galáxia.'),

('🔍','Exploradores da Natureza','Cacem cores e texturas pelo quintal ou pela praça.','natureza','agitada','25 min',25,'Ao ar livre',40,
 '["Cartela ou saquinho","Quintal ou praça"]'::jsonb,
 '["Dê uma cartela pra cada criança.","Explorem o jardim ou a praça.","Procurem cores e texturas: folha verde, casca áspera, pétala macia.","Reúnam tudo e contem as descobertas."]'::jsonb,
 'Explorar a natureza com atenção desperta a curiosidade e o vínculo com o mundo.'),
('🪴','Jardim Encantado na Garrafa','Um mini jardim que vive quase sozinho. Pura paciência.','natureza','cansada','25 min',25,'Em casa',35,
 '["Pote com tampa","Pedrinhas","Terra","Plantinhas pequenas"]'::jsonb,
 '["Coloque pedrinhas no fundo.","Adicione uma camada de terra.","Plante as plantinhas com cuidado.","Feche e deixe num lugar com luz indireta."]'::jsonb,
 'É um jardim fechado que se cuida quase sozinho. Regar com carinho ensina paciência.'),
('🌸','Corações com Flores','Guarde a beleza da natureza num coração pra sempre.','natureza','cansada','20 min',20,'Em casa',30,
 '["Papel vegetal","Cola transparente","Flores secas","Molde de coração"]'::jsonb,
 '["Desenhe um coração no papel vegetal.","Passe cola transparente dentro do contorno.","Espalhe as flores secas.","Espere secar e descole com cuidado."]'::jsonb,
 'Prensar flores guarda a beleza da natureza, e cada coração fica único.'),
('🌳','Aventura ao Ar Livre','Saiam pra explorar o mundo de verdade. O melhor app é lá fora.','natureza','agitada','30 min',30,'Ao ar livre',45,
 '["Vontade de explorar"]'::jsonb,
 '["Escolham um lugar: parque, quintal, trilha.","Observem plantas, insetos e detalhes.","Registrem com desenhos ou fotos mentais.","Voltem e conversem sobre o que descobriram."]'::jsonb,
 'Observar o mundo de perto aproxima a criança da natureza e aguça os sentidos.'),

('🦋','Borboleta que Bate as Asas','Puxe o fio e ela bate as asas de verdade.','arte','curiosa','20 min',20,'Em casa',30,
 '["Papel colorido","Canudo","Elástico","Olhinhos"]'::jsonb,
 '["Recorte e decore as asas.","Cole as asas no canudo.","Prenda os canudos com elásticos.","Puxe e solte pra ver ela bater as asas."]'::jsonb,
 'A borboleta de verdade bate as asas mais de 5 mil vezes por minuto.'),
('🔮','Caleidoscópio Caseiro','Gira, brilha e encanta. Um mundo de cores que muda.','arte','curiosa','20 min',20,'Em casa',30,
 '["Rolinho de papelão","Papel espelhado","Miçangas","Celofane"]'::jsonb,
 '["Forme um triângulo com 3 tiras espelhadas dentro do rolinho.","Coloque miçangas numa ponta.","Feche com celofane transparente.","Gire e observe as cores na luz."]'::jsonb,
 'Os espelhos refletem as miçangas várias vezes, criando padrões que mudam.'),
('🎭','Teatrinho de Sombras','Apague a luz e dê vida a histórias na parede.','arte','curiosa','20 min',20,'Em casa',30,
 '["Caixa de papelão","Papel vegetal","Palitos","Lanterna"]'::jsonb,
 '["Faça uma tela com papel vegetal numa caixa.","Recorte personagens e cole em palitos.","Apague a luz e acenda a lanterna atrás.","Crie histórias com as sombras."]'::jsonb,
 'A luz atrás dos personagens projeta as sombras na tela, e cada história fica única.'),
('📞','Telefone de Lata','Som que viaja pelo barbante de um copo ao outro.','arte','agitada','15 min',15,'Em casa',25,
 '["2 copos","Barbante","Palito"]'::jsonb,
 '["Fure o fundo de dois copos.","Passe o barbante e dê um nó em cada ponta.","Estique bem o barbante.","Fale num copo e ouça no outro."]'::jsonb,
 'A voz vira vibração e viaja pelo barbante esticado até o outro copo.'),
('🌽','Pé de Milho das Mãos','Suas mãos viram espigas de alegria. Arraiá criativo!','arte','cansada','15 min',15,'Em casa',25,
 '["Tinta amarela e verde","Papel","Cola"]'::jsonb,
 '["Carimbe as mãos com tinta amarela no papel.","Faça as folhas verdes do pé de milho.","Cole as folhas.","Deixe secar e pronto."]'::jsonb,
 'Pintar com as próprias mãos estimula a criatividade e a expressão da criança.'),
('❄️','Globo de Neve Caseiro','Vire, agite e veja nevar dentro de um potinho.','arte','cansada','15 min',15,'Em casa',25,
 '["Pote com tampa","Glitter","Enfeite pequeno","Água e detergente"]'::jsonb,
 '["Cole um enfeite na tampa por dentro.","Coloque água e uma gota de detergente no pote.","Adicione glitter.","Feche, vire e agite pra nevar."]'::jsonb,
 'O detergente deixa o glitter cair devagar, imitando floquinhos de neve.'),

('🎨','Caça ao Tesouro das Cores','Escolham uma cor e saiam caçando pela casa.','movimento','agitada','15 min',15,'Em casa',25,
 '["Uma cor escolhida","A casa toda"]'::jsonb,
 '["Escolham juntos uma cor.","Saiam caçando 5 objetos dessa cor pela casa.","Quem achar primeiro conta uma história sobre o objeto.","Troquem de cor e recomecem."]'::jsonb,
 'Procurar por cor treina a atenção e transforma a casa num parque de descobertas.'),
('🎳','Boliche de Garrafa PET','Monte os pinos e mire pra derrubar tudo.','movimento','agitada','15 min',15,'Em casa',25,
 '["6 garrafas pet","Água ou areia","Uma bola"]'::jsonb,
 '["Coloque um pouco de água em cada garrafa pra firmar.","Monte as garrafas como pinos.","Marque uma linha e role a bola.","Conte quantas derrubou."]'::jsonb,
 'Mirar e calcular a força trabalha a coordenação e a concentração.'),
('🎡','Cata-vento de Papel','Soprou, girou! Um clássico que nunca sai de moda.','movimento','agitada','10 min',10,'Ao ar livre',20,
 '["Papel quadrado","Tesoura","Alfinete","Palito"]'::jsonb,
 '["Corte as pontas em direção ao centro.","Dobre uma ponta de cada lado até o meio.","Prenda com o alfinete.","Fixe no palito e sopre pra girar."]'::jsonb,
 'O vento bate nas pás dobradas e empurra cada uma, fazendo o cata-vento girar.'),
('🚀','Foguete de Balão','Encha, solte e veja a diversão decolar pelo barbante.','movimento','agitada','15 min',15,'Em casa',25,
 '["Balão","Barbante longo","Canudo","Fita"]'::jsonb,
 '["Passe o barbante pelo canudo e estique entre dois pontos.","Encha o balão sem soltar.","Prenda o balão no canudo com fita.","Solte e veja o foguete disparar."]'::jsonb,
 'O ar saindo do balão empurra pra trás, e o foguete vai pra frente.'),
('🪂','Paraquedas de Sacola','Solte do alto e veja descer flutuando, devagarinho.','movimento','agitada','15 min',15,'Em casa',30,
 '["Sacola plástica","Barbante","Boneco pequeno","Fita"]'::jsonb,
 '["Corte a sacola num quadrado.","Amarre barbante em cada ponta.","Junte as pontas no boneco.","Solte do alto e veja descer flutuando."]'::jsonb,
 'O paraquedas segura o ar embaixo dele, e esse ar deixa a queda mais lenta.'),
('🎣','Pescaria Magnética','Festa junina em casa: pegue os peixes com o ímã.','movimento','agitada','25 min',25,'Em casa',35,
 '["Ímã","Clipes","Barbante","Palito","Papel"]'::jsonb,
 '["Recorte peixes de papel e prenda um clipe em cada.","Amarre o ímã no barbante e o barbante no palito.","Espalhe os peixes na lagoa de papel.","Pesque usando o ímã."]'::jsonb,
 'O ímã atrai o metal do clipe, e por isso o peixe de papel morde a isca sozinho.'),

('💬','O Melhor do Meu Dia','Três perguntas que viram conversa de verdade. Só vocês.','conversa','cansada','10 min',10,'Em qualquer lugar',15,
 '["Só vocês dois"]'::jsonb,
 '["Pergunte: qual foi a melhor parte do seu dia?","Pergunte: o que te fez rir hoje?","Pergunte: se hoje fosse uma cor, qual seria?","Conte também as suas respostas. É mão dupla."]'::jsonb,
 'Perguntas abertas desenvolvem a imaginação e a forma da criança falar do que sente.'),
('🌙','Gratidão da Noite','Feche o dia com leveza, lembrando do que foi bom.','conversa','cansada','5 min',5,'Antes de dormir',15,
 '["Só vocês dois"]'::jsonb,
 '["Cada um diz uma coisa boa que aconteceu hoje.","Uma pessoa que foi legal com você.","Algo que você fez bem.","Terminem com um obrigado um pro outro."]'::jsonb,
 'Falar do que foi bom antes de dormir ajuda a criança a fechar o dia tranquila.'),
('✨','Se Eu Fosse...','Brincadeira de imaginar que revela o jeitinho da criança.','conversa','cansada','5 min',5,'Em qualquer lugar',15,
 '["Só a imaginação de vocês"]'::jsonb,
 '["Se você fosse um animal, qual seria?","Se fosse um superpoder, qual escolheria?","Se fosse um lugar do mundo, qual seria?","Deixe a criança perguntar de volta pra você."]'::jsonb,
 'Brincar de e se estimula a imaginação e revela muito sobre quem a criança é.'),

('🍮','Gelatina Sensorial','Macia, colorida e divertida. E no fim dá pra comer.','cozinha','cansada','20 min + espera',20,'Em casa',30,
 '["Gelatina colorida","Água quente","Água fria","Forminhas"]'::jsonb,
 '["Dissolva a gelatina na água quente, com um adulto.","Misture a água fria.","Despeje nas forminhas.","Leve à geladeira e depois explore com as mãos."]'::jsonb,
 'Mexer na gelatina firme estimula o tato, e ainda vira lanche.'),
('🍿','Pipoca Colorida','Colorida, crocante e cheia de alegria.','cozinha','cansada','20 min',20,'Em casa',30,
 '["Milho de pipoca","Corante alimentício","Óleo","Açúcar"]'::jsonb,
 '["Estoure a pipoca, com um adulto.","Misture corante com um pouco de açúcar.","Misture na pipoca ainda morna.","Deixe secar e divirta-se."]'::jsonb,
 'A pipoca é um grão que guarda água dentro: o calor vira vapor e faz puf!'),
('🧪','Suco que Muda de Cor','Um suco detetive que troca de cor como mágica.','cozinha','curiosa','15 min',15,'Em casa',25,
 '["Repolho roxo","Água quente","Limão","Bicarbonato"]'::jsonb,
 '["Deixe repolho roxo na água quente até ela ficar roxa, com um adulto.","Coe e separe em copos.","Pingue limão num copo e bicarbonato no outro.","Veja a cor mudar."]'::jsonb,
 'O repolho roxo muda de cor com ácido e base. É um detetive de química!'),
('🍯','Massinha Comestível','Massinha de verdade que dá pra modelar e comer.','cozinha','cansada','15 min',15,'Em casa',25,
 '["Leite em pó","Mel ou leite condensado","Corante alimentício"]'::jsonb,
 '["Misture leite em pó com mel aos poucos.","Sove até dar liga e soltar das mãos.","Divida e pinte com corante alimentício.","Modele, brinque e pode comer."]'::jsonb,
 'É massinha comestível: a diversão de modelar que vira lanche.'),
('🍪','Biscoito Carimbado','Corte, decore e encha a casa de cheirinho.','cozinha','cansada','30 min',30,'Em casa',40,
 '["Massa de biscoito pronta","Cortadores","Confeitos"]'::jsonb,
 '["Abra a massa com um adulto.","Corte formas com os cortadores.","Decore com confeitos.","Asse e espere esfriar pra provar."]'::jsonb,
 'Medir, abrir e cortar a massa trabalha as mãozinhas, e o forno dá o prêmio.');

-- =====================================================
-- CRIANCAS
-- =====================================================
create table public.criancas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null,
  idade int,
  interesses text[] default '{}',
  materiais_em_casa text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index criancas_user_id_idx on public.criancas(user_id);

grant select, insert, update, delete on public.criancas to authenticated;
grant all on public.criancas to service_role;

alter table public.criancas enable row level security;
create policy "criancas dono select" on public.criancas for select to authenticated using (auth.uid() = user_id);
create policy "criancas dono insert" on public.criancas for insert to authenticated with check (auth.uid() = user_id);
create policy "criancas dono update" on public.criancas for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "criancas dono delete" on public.criancas for delete to authenticated using (auth.uid() = user_id);

create trigger criancas_touch_updated before update on public.criancas
  for each row execute function public.touch_updated_at();

-- =====================================================
-- CONCLUSOES
-- =====================================================
create table public.conclusoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  crianca_id uuid references public.criancas(id) on delete set null,
  activity_id uuid references public.activities(id) on delete set null,
  titulo_snapshot text,
  tela_min int,
  foto_url text,
  feito_em timestamptz default now()
);
create index conclusoes_user_id_idx on public.conclusoes(user_id);
create index conclusoes_feito_em_idx on public.conclusoes(feito_em desc);

grant select, insert, update, delete on public.conclusoes to authenticated;
grant all on public.conclusoes to service_role;

alter table public.conclusoes enable row level security;
create policy "conclusoes dono select" on public.conclusoes for select to authenticated using (auth.uid() = user_id);
create policy "conclusoes dono insert" on public.conclusoes for insert to authenticated with check (auth.uid() = user_id);
create policy "conclusoes dono update" on public.conclusoes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "conclusoes dono delete" on public.conclusoes for delete to authenticated using (auth.uid() = user_id);

-- =====================================================
-- INDICACOES
-- =====================================================
create table public.indicacoes (
  id uuid primary key default gen_random_uuid(),
  indicador_id uuid not null references auth.users(id) on delete cascade,
  codigo text unique not null,
  convidado_id uuid references auth.users(id) on delete set null,
  recompensado boolean default false,
  created_at timestamptz default now()
);
create index indicacoes_indicador_idx on public.indicacoes(indicador_id);

grant select, insert, update, delete on public.indicacoes to authenticated;
grant all on public.indicacoes to service_role;

alter table public.indicacoes enable row level security;
create policy "indicacoes dono select" on public.indicacoes for select to authenticated using (auth.uid() = indicador_id);
create policy "indicacoes dono insert" on public.indicacoes for insert to authenticated with check (auth.uid() = indicador_id);
create policy "indicacoes dono update" on public.indicacoes for update to authenticated using (auth.uid() = indicador_id) with check (auth.uid() = indicador_id);

-- =====================================================
-- FAVORITOS
-- =====================================================
create table public.favoritos (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, activity_id)
);

grant select, insert, update, delete on public.favoritos to authenticated;
grant all on public.favoritos to service_role;

alter table public.favoritos enable row level security;
create policy "favoritos dono select" on public.favoritos for select to authenticated using (auth.uid() = user_id);
create policy "favoritos dono insert" on public.favoritos for insert to authenticated with check (auth.uid() = user_id);
create policy "favoritos dono delete" on public.favoritos for delete to authenticated using (auth.uid() = user_id);

-- =====================================================
-- STORAGE: bucket "momentos" RLS policies
-- (o bucket em si é criado via tool após esta migration)
-- =====================================================
create policy "momentos dono select" on storage.objects for select to authenticated
  using (bucket_id = 'momentos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "momentos dono insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'momentos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "momentos dono update" on storage.objects for update to authenticated
  using (bucket_id = 'momentos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "momentos dono delete" on storage.objects for delete to authenticated
  using (bucket_id = 'momentos' and (storage.foldername(name))[1] = auth.uid()::text);
