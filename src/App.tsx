
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Clock3,
  Flame,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  X,
} from 'lucide-react';

type Category = {
  id: string;
  label: string;
};

type Option = {
  id: string;
  label: string;
  priceCents: number;
};

type OptionGroup = {
  id: string;
  name: string;
  required: boolean;
  type: 'single' | 'multi';
  options: Option[];
};

type MenuItem = {
  id: string;
  category: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  priceCents: number;
  image: string;
  alt: string;
  badges: Array<'Mais pedido' | 'Novo' | 'Picante'>;
  time: string;
  available: boolean;
  optionGroups: OptionGroup[];
};

type CartEntry = {
  key: string;
  item: MenuItem;
  selection: Record<string, string[]>;
  note: string;
  quantity: number;
  unitTotalCents: number;
};

const categories: Category[] = [
  { id: 'destaques', label: 'Destaques' },
  { id: 'smash', label: 'Smash burgers' },
  { id: 'combos', label: 'Combos' },
  { id: 'porcoes', label: 'Porções' },
  { id: 'bebidas', label: 'Bebidas' },
];

const itemCatalog: MenuItem[] = [
  {
    id: 'brasa-smash',
    category: 'smash',
    name: 'Brasa Smash',
    shortDescription: 'Two smash patties, melted cheddar, cebola roxa e molho BRASA.',
    fullDescription:
      'Pão brioche tostado, duas carnes smash, cheddar fundente, cebola roxa em lâminas, picles e molho BRASA com toque de mostarda e alho.',
    priceCents: 2890,
    image:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80',
    alt: 'Hambúrguer smash em prato com cheddar derretido',
    badges: ['Mais pedido'],
    time: '15 min',
    available: true,
    optionGroups: [
      {
        id: 'pao',
        name: 'Tipo de pão',
        required: true,
        type: 'single',
        options: [
          { id: 'brioche', label: 'Brioche', priceCents: 0 },
          { id: 'integral', label: 'Integral + R$ 4,00', priceCents: 400 },
        ],
      },
      {
        id: 'extra',
        name: 'Adicionais',
        required: false,
        type: 'multi',
        options: [
          { id: 'bacon', label: 'Bacon crocante', priceCents: 700 },
          { id: 'ovo', label: 'Ovo', priceCents: 600 },
          { id: 'duplo', label: 'Carne extra', priceCents: 1200 },
        ],
      },
    ],
  },
  {
    id: 'duplo-47',
    category: 'smash',
    name: 'Duplo 47',
    shortDescription: 'Carne dupla, queijo, alface, tomate e molho de pimenta.',
    fullDescription:
      'Dupla smash com queijo derretido, tomate, alface, picles e molho 47 em foco. Com sabor intenso e final defumado.',
    priceCents: 3490,
    image:
      'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Hambúrguer duplo com queijo e alface',
    badges: ['Novo'],
    time: '18 min',
    available: true,
    optionGroups: [
      {
        id: 'pao',
        name: 'Tipo de pão',
        required: true,
        type: 'single',
        options: [
          { id: 'brioche', label: 'Brioche', priceCents: 0 },
          { id: 'semente', label: 'Pão com sementes + R$ 3,00', priceCents: 300 },
        ],
      },
      {
        id: 'extra',
        name: 'Adicionais',
        required: false,
        type: 'multi',
        options: [
          { id: 'bacon', label: 'Bacon crocante', priceCents: 700 },
          { id: 'onion', label: 'Onion rings', priceCents: 900 },
          { id: 'pimenta', label: 'Pimenta extra', priceCents: 200 },
        ],
      },
    ],
  },
  {
    id: 'bacon-na-chapa',
    category: 'smash',
    name: 'Bacon na Chapa',
    shortDescription: 'Bacon, cheddar e cebola caramelizada em um smash clássico.',
    fullDescription:
      'Sabor de churrasco em chapa com bacon crocante, cheddar, cebola dourada e molho de alho na medida.',
    priceCents: 3290,
    image:
      'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=1200&q=80',
    alt: 'Hambúrguer com bacon crocante e cheddar',
    badges: ['Picante'],
    time: '20 min',
    available: true,
    optionGroups: [
      {
        id: 'pao',
        name: 'Tipo de pão',
        required: true,
        type: 'single',
        options: [
          { id: 'brioche', label: 'Brioche', priceCents: 0 },
          { id: 'integral', label: 'Integral + R$ 4,00', priceCents: 400 },
        ],
      },
      {
        id: 'extra',
        name: 'Adicionais',
        required: false,
        type: 'multi',
        options: [
          { id: 'duplo', label: 'Carne extra', priceCents: 1200 },
          { id: 'requeijao', label: 'Cream cheese', priceCents: 700 },
          { id: 'pimenta', label: 'Pimenta extra', priceCents: 200 },
        ],
      },
    ],
  },
  {
    id: 'veggie-de-rua',
    category: 'smash',
    name: 'Veggie de Rua',
    shortDescription: 'Burger vegetal com cebola, picles e molho barbecue.',
    fullDescription:
      'Proteína vegetal, cebola caramelizada, alface, tomate, picles e molho barbecue leve com textura de rua.',
    priceCents: 2490,
    image:
      'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=1200&q=80',
    alt: 'Hambúrguer vegetariano em pão brioche',
    badges: [],
    time: '16 min',
    available: true,
    optionGroups: [
      {
        id: 'pao',
        name: 'Tipo de pão',
        required: true,
        type: 'single',
        options: [
          { id: 'brioche', label: 'Brioche', priceCents: 0 },
          { id: 'integral', label: 'Integral + R$ 4,00', priceCents: 400 },
        ],
      },
      {
        id: 'extra',
        name: 'Adicionais',
        required: false,
        type: 'multi',
        options: [
          { id: 'queijo', label: 'Queijo vegano', priceCents: 500 },
          { id: 'avocado', label: 'Abacate', priceCents: 600 },
          { id: 'picles', label: 'Picles extra', priceCents: 300 },
        ],
      },
    ],
  },
  {
    id: 'combo-duplo',
    category: 'combos',
    name: 'Combo Duplo + fritas',
    shortDescription: 'Duplo 47 com fritas crocantes e bebida.',
    fullDescription:
      'Duplo 47 com porção de fritas e bebida de escolha. O melhor da rua em combo enxuto.',
    priceCents: 4890,
    image:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80',
    alt: 'Hambúrguer com porção de fritas e bebida',
    badges: ['Mais pedido'],
    time: '25 min',
    available: true,
    optionGroups: [
      {
        id: 'bebida',
        name: 'Bebida',
        required: true,
        type: 'single',
        options: [
          { id: 'coca', label: 'Coca 600 ml', priceCents: 0 },
          { id: 'mate', label: 'Mate com limão', priceCents: 500 },
          { id: 'agua', label: 'Água com gás', priceCents: 400 },
        ],
      },
      {
        id: 'extra',
        name: 'Complementos',
        required: false,
        type: 'multi',
        options: [
          { id: 'queijo', label: 'Queijo extra', priceCents: 700 },
          { id: 'onion', label: 'Onion rings', priceCents: 900 },
        ],
      },
    ],
  },
  {
    id: 'combo-brasa',
    category: 'combos',
    name: 'Combo Brasa',
    shortDescription: 'Brasa Smash, fritas e bebida gelada.',
    fullDescription:
      'Clássico BRASA com smash, porção de fritas e escolha de bebida no combo rápido.',
    priceCents: 4290,
    image:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80',
    alt: 'Combo de hambúrguer e fritas em mesa',
    badges: ['Novo'],
    time: '22 min',
    available: true,
    optionGroups: [
      {
        id: 'bebida',
        name: 'Bebida',
        required: true,
        type: 'single',
        options: [
          { id: 'coca', label: 'Coca 600 ml', priceCents: 0 },
          { id: 'mate', label: 'Mate com limão', priceCents: 500 },
          { id: 'agua', label: 'Água com gás', priceCents: 400 },
        ],
      },
    ],
  },
  {
    id: 'fritas-casa',
    category: 'porcoes',
    name: 'Fritas da Casa',
    shortDescription: 'Fritas douradas com sal grosso e maionese de alho.',
    fullDescription:
      'Porção de fritas com corte grosso e sal grosso, servidas com maionese de alho e ketchup artesanal.',
    priceCents: 1290,
    image:
      'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=1200&q=80',
    alt: 'Porção de fritas com molho',
    badges: [],
    time: '10 min',
    available: true,
    optionGroups: [
      {
        id: 'tamanho',
        name: 'Tamanho',
        required: true,
        type: 'single',
        options: [
          { id: 'medio', label: 'Médio', priceCents: 0 },
          { id: 'grande', label: 'Grande + R$ 5,00', priceCents: 500 },
        ],
      },
    ],
  },
  {
    id: 'onion-rings',
    category: 'porcoes',
    name: 'Onion Rings Picantes',
    shortDescription: 'Anéis crocantes com molho de pimenta e alho.',
    fullDescription:
      'Onion rings empanados com toque de pimenta, servidos com molho de alho e pimenta.',
    priceCents: 1490,
    image:
      'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=1200&q=80',
    alt: 'Porção de onion rings com molho',
    badges: ['Picante'],
    time: '12 min',
    available: false,
    optionGroups: [
      {
        id: 'molho',
        name: 'Molho',
        required: true,
        type: 'single',
        options: [
          { id: 'alho', label: 'Alho', priceCents: 0 },
          { id: 'pimenta', label: 'Pimenta + R$ 2,00', priceCents: 200 },
        ],
      },
    ],
  },
  {
    id: 'mate-limon',
    category: 'bebidas',
    name: 'Mate com Limão',
    shortDescription: 'Refrescante, cítrico e com leve acidez.',
    fullDescription:
      'Mate gelado com limão e leve toque de hortelã para acompanhar os smash da casa.',
    priceCents: 990,
    image:
      'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=1200&q=80',
    alt: 'Copo de mate com limão em mesa',
    badges: [],
    time: '5 min',
    available: true,
    optionGroups: [
      {
        id: 'tamanho',
        name: 'Tamanho',
        required: true,
        type: 'single',
        options: [
          { id: 'medio', label: '300 ml', priceCents: 0 },
          { id: 'grande', label: '500 ml + R$ 2,00', priceCents: 200 },
        ],
      },
    ],
  },
  {
    id: 'cola',
    category: 'bebidas',
    name: 'Cola',
    shortDescription: 'Gelada e clássica para o combo.',
    fullDescription:
      'Refrigerante de cola bem gelado para equilibrar o sabor do molho e da chapa.',
    priceCents: 890,
    image:
      'https://images.unsplash.com/photo-1622483767028-3f66f2aef2f3?auto=format&fit=crop&w=1200&q=80',
    alt: 'Garrafa e copo de refrigerante em mesa',
    badges: [],
    time: '5 min',
    available: true,
    optionGroups: [
      {
        id: 'tamanho',
        name: 'Tamanho',
        required: true,
        type: 'single',
        options: [
          { id: 'lata', label: 'Lata', priceCents: 0 },
          { id: 'garrafa', label: 'Garrafa + R$ 2,00', priceCents: 200 },
        ],
      },
    ],
  },
  {
    id: 'agua-gas',
    category: 'bebidas',
    name: 'Água com Gás',
    shortDescription: 'Água gasosa com leve borbulha.',
    fullDescription:
      'Água com gás para refrescar entre bites e avisar que o turno da rua está em alta.',
    priceCents: 690,
    image:
      'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=1200&q=80',
    alt: 'Garrafa de água com gás e gelo',
    badges: [],
    time: '3 min',
    available: true,
    optionGroups: [
      {
        id: 'tamanho',
        name: 'Tamanho',
        required: true,
        type: 'single',
        options: [
          { id: 'medio', label: '500 ml', priceCents: 0 },
          { id: 'grande', label: '750 ml + R$ 2,00', priceCents: 200 },
        ],
      },
    ],
  },
];

const featuredItems = ['brasa-smash', 'duplo-47', 'combo-duplo'];

const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100);

const getInitialSelection = (item: MenuItem): Record<string, string[]> => {
  const defaults: Record<string, string[]> = {};

  item.optionGroups.forEach((group) => {
    const selected = group.options.filter((option) => option.id === 'brioche' || option.id === 'medio' || option.id === 'coca' || option.id === 'alho');
    if (selected.length > 0) {
      defaults[group.id] = [selected[0].id];
    }
  });

  return defaults;
};

const getKeyFromSelection = (itemId: string, selection: Record<string, string[]>) => {
  const combined = Object.entries(selection)
    .map(([key, values]) => `${key}:${values.join(',')}`)
    .join('|');

  return `${itemId}|${combined}`;
};

const sumSelectedOptions = (item: MenuItem, selection: Record<string, string[]>) =>
  item.optionGroups.reduce((sum, group) => {
    const selectedIds = selection[group.id] ?? [];

    return (
      sum +
      group.options
        .filter((option) => selectedIds.includes(option.id))
        .reduce((total, option) => total + option.priceCents, 0)
    );
  }, 0);

const getOptionValue = (groupId: string, selection: Record<string, string[]>, fallback: string) =>
  selection[groupId]?.[0] ?? fallback;

function Button({
  children,
  variant = 'primary',
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const styles = {
    primary:
      'bg-[var(--color-brand-action)] text-[var(--color-brand-text)] hover:bg-[var(--color-brand-action-strong)]',
    secondary:
      'bg-[var(--color-brand-surface-alt)] text-[var(--color-brand-text)] border border-[var(--color-brand-border)] hover:bg-[var(--color-brand-surface)]',
    ghost: 'bg-transparent text-[var(--color-brand-muted)] border border-[var(--color-brand-border)] hover:text-[var(--color-brand-text)]',
  };

  return (
    <button
      className={`inline-flex min-h-[44px] items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-bg)] ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function IconButton({
  children,
  className = '',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] text-[var(--color-brand-text)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-bg)] hover:bg-[var(--color-brand-surface-alt)] ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

function CategoryChip({
  active,
  category,
  onClick,
}: {
  active: boolean;
  category: Category;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-bg)] ${
        active
          ? 'border-[var(--color-brand-action)] bg-[var(--color-brand-action)] text-white shadow-soft'
          : 'border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] text-[var(--color-brand-muted)]'
      }`}
    >
      {category.label}
    </button>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-text)]">
      {children}
    </span>
  );
}

function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (nextValue: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-1.5">
      <IconButton
        aria-label="Diminuir quantidade"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="h-9 w-9 border-0 bg-transparent"
      >
        <Minus size={16} />
      </IconButton>
      <span className="min-w-8 text-center text-sm font-semibold">{value}</span>
      <IconButton
        aria-label="Aumentar quantidade"
        onClick={() => onChange(value + 1)}
        className="h-9 w-9 border-0 bg-transparent"
      >
        <Plus size={16} />
      </IconButton>
    </div>
  );
}

function Price({ value }: { value: number }) {
  return <span className="font-semibold text-[var(--color-brand-action)]">{formatMoney(value)}</span>;
}

function MenuCard({ item, onSelect }: { item: MenuItem; onSelect: (item: MenuItem) => void }) {
  const handleClick = () => onSelect(item);

  return (
    <div className="group overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] shadow-soft transition-transform duration-200 hover:-translate-y-0.5">
      <button
        type="button"
        onClick={handleClick}
        className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-bg)]"
      >
        <div className="relative">
          <img
            src={item.image}
            alt={item.alt}
            loading="lazy"
            className={`${item.available ? 'opacity-100' : 'opacity-50 grayscale'} h-44 w-full object-cover`}
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {item.badges.map((badge) => (
              <Badge key={badge}>{badge}</Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-bold text-[var(--color-brand-text)]">{item.name}</h3>
            </div>
            <Price value={item.priceCents} />
          </div>

          <p className="text-sm leading-6 text-[var(--color-brand-muted)]">{item.shortDescription}</p>

          <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-brand-muted)]">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} />
              {item.time}
            </span>
            {!item.available && (
              <span className="rounded-full bg-[rgba(255,255,255,0.05)] px-2 py-1 font-semibold text-[var(--color-brand-muted)]">
                Esgotado
              </span>
            )}
          </div>

          <div className="pt-1">
            <Button
              type="button"
              variant={item.available ? 'primary' : 'secondary'}
              className="w-full disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!item.available}
              onClick={(event) => {
                event.stopPropagation();
                if (item.available) onSelect(item);
              }}
            >
              {item.available ? 'Adicionar' : 'Indisponível'}
            </Button>
          </div>
        </div>
      </button>
    </div>
  );
}

function Sheet({
  open,
  title,
  onClose,
  children,
  triggerRef,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  triggerRef?: React.RefObject<HTMLButtonElement>;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const node = dialogRef.current;
    if (node) {
      node.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      triggerRef?.current?.focus();
    };
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(0,0,0,0.55)] p-0 md:items-center md:p-6" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        tabIndex={-1}
        className="w-full max-w-2xl overflow-hidden rounded-t-[28px] border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] shadow-soft outline-none md:rounded-[28px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-brand-border)] px-4 py-3">
          <h2 id="sheet-title" className="font-display text-2xl font-bold text-[var(--color-brand-text)]">
            {title}
          </h2>
          <IconButton aria-label="Fechar painel" onClick={onClose} className="h-10 w-10 border-0 bg-transparent">
            <X size={20} />
          </IconButton>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

function App() {
  const [selectedCategory, setSelectedCategory] = useState('destaques');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectionDraft, setSelectionDraft] = useState<Record<string, string[]>>({});
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);
  const selectedTriggerRef = useRef<HTMLButtonElement | null>(null);

  const visibleItems = useMemo(() => {
    if (selectedCategory === 'destaques') {
      return itemCatalog.filter((item) => featuredItems.includes(item.id));
    }
    return itemCatalog.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitTotalCents * item.quantity, 0),
    [cart],
  );
  const fee = cart.length ? 940 : 0;
  const total = subtotal + fee;

  useEffect(() => {
    if (!selectedItem) {
      setSelectionDraft({});
      return;
    }

    setSelectionDraft(getInitialSelection(selectedItem));
  }, [selectedItem]);

  const openItemDetail = (item: MenuItem) => {
    selectedTriggerRef.current = document.activeElement as HTMLButtonElement;
    setSelectedItem(item);
  };

  const closeItemDetail = () => {
    setSelectedItem(null);
    setSelectionDraft({});
  };

  const handleSelectionToggle = (groupId: string, optionId: string, type: 'single' | 'multi') => {
    setSelectionDraft((current) => {
      const groupValue = current[groupId] ?? [];

      if (type === 'single') {
        return { ...current, [groupId]: [optionId] };
      }

      const exists = groupValue.includes(optionId);
      return {
        ...current,
        [groupId]: exists ? groupValue.filter((value) => value !== optionId) : [...groupValue, optionId],
      };
    });
  };

  const canAddToCart = (item: MenuItem) => {
    if (!item.available) return false;

    return item.optionGroups.every((group) => {
      const selected = selectionDraft[group.id] ?? [];
      if (!group.required) return true;
      return selected.length > 0;
    });
  };

  const addSelectedItemToCart = () => {
    if (!selectedItem) return;

    if (!canAddToCart(selectedItem)) return;

    const unitTotal = selectedItem.priceCents + sumSelectedOptions(selectedItem, selectionDraft);
    const key = getKeyFromSelection(selectedItem.id, selectionDraft);

    setCart((current) => {
      const existing = current.find((entry) => entry.key === key);

      if (existing) {
        return current.map((entry) =>
          entry.key === key ? { ...entry, quantity: entry.quantity + 1 } : entry,
        );
      }

      return [
        ...current,
        {
          key,
          item: selectedItem,
          selection: selectionDraft,
          note: '',
          quantity: 1,
          unitTotalCents: unitTotal,
        },
      ];
    });

    closeItemDetail();
    setCartOpen(true);
  };

  const updateQuantity = (key: string, nextQuantity: number) => {
    setCart((current) =>
      current
        .map((entry) => (entry.key === key ? { ...entry, quantity: nextQuantity } : entry))
        .filter((entry) => entry.quantity > 0),
    );
  };

  const removeCartItem = (key: string) => {
    setCart((current) => current.filter((entry) => entry.key !== key));
  };

  const finalizeOrder = () => {
    if (!cart.length) return;

    setOrderConfirmed(true);
    setCartOpen(false);
    setOrderNumber(String(Math.floor(100 + Math.random() * 900)));
    setCart([]);
  };

  const scrollToMenu = () => {
    document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-bg)] text-[var(--color-brand-text)]">
      <div className="mx-auto max-w-[1280px] px-4 pb-28 pt-4 md:px-6 lg:px-8">
        <header className="sticky top-0 z-30 mb-6 border-b border-[var(--color-brand-border)] bg-[rgba(16,16,16,0.88)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-action)] font-display text-sm font-extrabold text-white">
                B47
              </div>
              <div>
                <div className="font-display text-lg font-bold uppercase tracking-[0.14em]">BRASA 47</div>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] px-3 py-1.5 text-xs font-medium text-[var(--color-brand-muted)] sm:flex">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-brand-success)]" />
              Aberto agora
            </div>

            <button
              ref={cartButtonRef}
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex items-center gap-3 rounded-full bg-[var(--color-brand-action)] px-4 py-2.5 text-sm font-semibold text-white shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-bg)]"
              aria-label="Abrir carrinho"
            >
              <ShoppingBag size={18} />
              <span>Carrinho</span>
              {cart.length > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-[var(--color-brand-action)]">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
              {cart.length > 0 && <span className="hidden sm:inline">{formatMoney(total)}</span>}
            </button>
          </div>
        </header>

        <main className="space-y-10">
          <section className="overflow-hidden rounded-[28px] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] shadow-soft">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="pattern-grid relative flex flex-col justify-between overflow-hidden p-6 md:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,102,45,0.12),transparent_34%)]" aria-hidden="true" />
                <div className="relative z-10 space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-border)] bg-[rgba(18,18,18,0.9)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-brand-muted)]">
                    <Flame size={12} className="text-[var(--color-brand-action)]" />
                    SMASH • FOGO • RUA
                  </div>

                  <div className="space-y-4">
                    <h1 className="font-display text-4xl font-extrabold leading-none tracking-[-0.04em] text-[var(--color-brand-text)] md:text-5xl xl:text-6xl">
                      Fogo alto. Sabor sem cerimônia.
                    </h1>
                    <p className="max-w-lg text-base leading-7 text-[var(--color-brand-muted)]">
                      Smash burgers reforçados, combos focados e porções de rua para correr na fila como se fosse
                      o último da noite.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--color-brand-muted)]">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] px-3 py-2">
                    <Clock3 size={14} className="text-[var(--color-brand-action)]" />
                    20–30 min
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] px-3 py-2">
                    <Star size={14} className="fill-[var(--color-brand-action)] text-[var(--color-brand-action)]" />
                    4,9 • 1.8k
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-border)] bg-[var(--color-brand-surface-alt)] px-3 py-2">
                    <span className="text-[var(--color-brand-action)]">•</span>
                    Retirada em 10 min
                  </div>
                </div>

                <div className="relative z-10 mt-8 flex flex-wrap gap-3">
                  <Button type="button" onClick={scrollToMenu}>Ver destaques</Button>
                  <Button type="button" variant="secondary" onClick={() => setCartOpen(true)}>
                    Ver carrinho
                  </Button>
                </div>
              </div>

              <div className="relative min-h-[320px] overflow-hidden bg-[var(--color-brand-surface-alt)]">
                <img
                  src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80"
                  alt="Burger de alta qualidade com fritas e molho"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black via-black/10 to-transparent p-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand-muted)]">Destaque</div>
                    <div className="font-display text-2xl font-bold">Combo BRASA</div>
                  </div>
                  <div className="rounded-full bg-[var(--color-brand-action)] px-3 py-1.5 text-sm font-semibold text-white">
                    R$ 42,90
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="menu-section" className="space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand-muted)]">Cardápio</p>
                <h2 className="font-display text-3xl font-bold text-[var(--color-brand-text)]">O que vai na chapa</h2>
              </div>
              <div className="hidden text-sm text-[var(--color-brand-muted)] md:block">Fogo, crosta e simplicidade.</div>
            </div>

            <div className="overflow-x-auto pb-2">
              <div className="flex min-w-max gap-2">
                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    active={selectedCategory === category.id}
                    category={category}
                    onClick={() => setSelectedCategory(category.id)}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map((item) => (
                <MenuCard key={item.id} item={item} onSelect={openItemDetail} />
              ))}
            </div>
          </section>
        </main>
      </div>

      {selectedItem && (
        <Sheet open={Boolean(selectedItem)} onClose={closeItemDetail} title="Personalizar item" triggerRef={selectedTriggerRef}>
          <div className="space-y-6 p-4 md:p-5">
            <div className="overflow-hidden rounded-[22px] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)]">
              <img
                src={selectedItem.image}
                alt={selectedItem.alt}
                className="h-52 w-full object-cover"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[var(--color-brand-text)]">{selectedItem.name}</h3>
                </div>
                <Price value={selectedItem.priceCents} />
              </div>
              <p className="text-sm leading-6 text-[var(--color-brand-muted)]">{selectedItem.fullDescription}</p>
            </div>

            <div className="space-y-5">
              {selectedItem.optionGroups.map((group) => (
                <div key={group.id} className="space-y-3 rounded-[22px] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-[var(--color-brand-text)]">{group.name}</span>
                    {group.required && (
                      <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-brand-action)]">
                        Obrigatório
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isSelected = (selectionDraft[group.id] ?? []).includes(option.id);
                      const isSingle = group.type === 'single';

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleSelectionToggle(group.id, option.id, group.type)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-brand-bg)] ${
                            isSelected
                              ? 'border-[var(--color-brand-action)] bg-[rgba(216,102,45,0.08)]'
                              : 'border-[var(--color-brand-border)] bg-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                                isSelected
                                  ? 'border-[var(--color-brand-action)] bg-[var(--color-brand-action)] text-white'
                                  : 'border-[var(--color-brand-border)] bg-transparent text-transparent'
                              }`}
                            >
                              {isSingle ? (isSelected ? '•' : '') : isSelected ? <Check size={10} /> : ''}
                            </span>
                            <span className="text-sm text-[var(--color-brand-text)]">{option.label}</span>
                          </div>
                          {option.priceCents > 0 && (
                            <span className="text-sm font-semibold text-[var(--color-brand-action)]">
                              +{formatMoney(option.priceCents)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[22px] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-3">
              <label htmlFor="order-note" className="mb-2 block text-sm font-medium text-[var(--color-brand-text)]">
                Observação para a cozinha
              </label>
              <textarea
                id="order-note"
                rows={3}
                className="w-full rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] px-3 py-2 text-sm text-[var(--color-brand-text)] placeholder:text-[var(--color-brand-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-action)]"
                placeholder="Sem cebola, extra molho, ponto da carne..."
              />
            </div>

            <div className="rounded-[22px] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-3">
              <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-brand-muted)]">
                <span>Subtotal</span>
                <span>{formatMoney(selectedItem.priceCents + sumSelectedOptions(selectedItem, selectionDraft))}</span>
              </div>
            </div>

            <div className="sticky bottom-0 z-10 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
              <Button
                type="button"
                className="w-full"
                disabled={!canAddToCart(selectedItem)}
                onClick={addSelectedItemToCart}
              >
                Adicionar ao pedido
              </Button>
            </div>
          </div>
        </Sheet>
      )}

      {cartOpen && (
        <Sheet open={cartOpen} title="Seu pedido" onClose={() => setCartOpen(false)} triggerRef={cartButtonRef}>
          <div className="space-y-5 p-4 md:p-5">
            {cart.length === 0 ? (
              <div className="space-y-3 py-10 text-center">
                <p className="font-display text-2xl font-bold text-[var(--color-brand-text)]">Carrinho vazio</p>
                <p className="text-sm text-[var(--color-brand-muted)]">
                  Escolha um smash, combo ou bebida para começar sua experiência BRASA 47.
                </p>
                <Button type="button" variant="secondary" onClick={() => setCartOpen(false)} className="mx-auto">
                  Voltar ao cardápio
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cart.map((entry) => (
                    <div key={entry.key} className="rounded-[22px] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-display text-xl font-bold text-[var(--color-brand-text)]">{entry.item.name}</div>
                          <div className="mt-1 text-xs text-[var(--color-brand-muted)]">
                            {Object.entries(entry.selection).flatMap(([groupId, values]) => {
                              const groupName = entry.item.optionGroups.find((group) => group.id === groupId)?.name ?? groupId;
                              const labels = entry.item.optionGroups
                                .find((group) => group.id === groupId)
                                ?.options.filter((option) => values.includes(option.id))
                                .map((option) => option.label) ?? [];

                              return labels.length > 0 ? [`${groupName}: ${labels.join(', ')}`] : [];
                            }).join(' • ')}
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remover ${entry.item.name}`}
                          onClick={() => removeCartItem(entry.key)}
                          className="text-sm text-[var(--color-brand-muted)] underline underline-offset-4"
                        >
                          Remover
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <QuantityStepper
                          value={entry.quantity}
                          onChange={(nextValue) => updateQuantity(entry.key, nextValue)}
                        />
                        <div className="text-right">
                          <div className="text-sm text-[var(--color-brand-muted)]">Unitário</div>
                          <div className="font-semibold text-[var(--color-brand-text)]">
                            <Price value={entry.unitTotalCents} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[22px] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-4">
                  <div className="space-y-2 text-sm text-[var(--color-brand-muted)]">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>{formatMoney(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Taxa simulada</span>
                      <span>{formatMoney(fee)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[var(--color-brand-border)] pt-2 text-base font-semibold text-[var(--color-brand-text)]">
                      <span>Total</span>
                      <span>{formatMoney(total)}</span>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 z-10 border-t border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] pb-[max(env(safe-area-inset-bottom),1rem)] pt-3">
                  <Button type="button" className="w-full" onClick={finalizeOrder} disabled={!cart.length}>
                    Finalizar pedido
                  </Button>
                </div>
              </>
            )}
          </div>
        </Sheet>
      )}

      {orderConfirmed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.64)] p-4">
          <div className="w-full max-w-md rounded-[28px] border border-[var(--color-brand-border)] bg-[var(--color-brand-surface)] p-6 text-center shadow-soft">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(45,155,98,0.15)] text-[var(--color-brand-success)]">
              <Check size={28} />
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-brand-success)]">Pedido confirmado</p>
            <h3 className="mt-2 font-display text-3xl font-bold text-[var(--color-brand-text)]">Pedido #{orderNumber}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--color-brand-muted)]">
              Sua experiência é uma demonstração local. Nenhuma transação de pagamento foi concluída.
            </p>
            <div className="mt-4 rounded-2xl border border-[var(--color-brand-border)] bg-[var(--color-brand-bg)] p-3 text-sm text-[var(--color-brand-muted)]">
              Estimativa de 20–30 min • Pagamento na retirada
            </div>
            <div className="mt-6">
              <Button type="button" className="w-full" onClick={() => setOrderConfirmed(false)}>
                Voltar ao cardápio
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
