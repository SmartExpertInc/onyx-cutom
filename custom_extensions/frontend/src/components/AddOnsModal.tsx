import { useState } from 'react';
import { Coins, Workflow, Server, LucideIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddOn {
  id: string;
  name: string;
  description: string;
  amount: string;
  price: string | number;
  priceNote?: string;
  isEnterprise?: boolean;
}

interface ManageAddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AddOnCardProps {
  addOn: AddOn;
  icon: LucideIcon;
  quantity: number;
  onQuantityChange: (delta: number) => void;
}

function AddOnCard({ addOn, icon: Icon, quantity, onQuantityChange }: AddOnCardProps) {
  const { t } = useLanguage();
  return (
    <Card className="hover:shadow-lg transition-shadow border border-gray-200">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 rounded-full p-3">
            <Icon className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{addOn.name}</CardTitle>
            <CardDescription className="mt-1 text-gray-500">{addOn.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <span>{addOn.amount}</span>
        </div>
        <div className="text-3xl font-bold text-gray-900">
          {typeof addOn.price === 'number' ? `$${addOn.price}` : addOn.price}
          {addOn.priceNote === 'per month' && (
            <span className="text-lg font-normal text-gray-600">/month</span>
          )}
                  </div>
        {!addOn.isEnterprise && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(-1)}
              className="h-10 w-10 bg-white"
            >
              -
            </Button>
            <div className="flex-1 text-center font-medium">{quantity}</div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onQuantityChange(1)}
              className="h-10 w-10 bg-white"
            >
              +
            </Button>
          </div>
        )}
        <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white" variant="download">
          {addOn.isEnterprise ? t('addOns.contactSales', 'Contact Sales') : t('addOns.buyNow', 'Buy Now')}
        </Button>
        {addOn.priceNote && addOn.priceNote !== 'per month' && (
          <p className="text-center text-sm text-gray-500">{addOn.priceNote}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function ManageAddonsModal({ isOpen, onClose }: ManageAddonsModalProps) {
  const { t } = useLanguage();
  
  const CREDITS_DATA_TRANSLATED: AddOn[] = [
    {
      id: 'small',
      name: t('addOns.packages.credits.small.name', 'Small'),
      description: t('addOns.packages.credits.small.description', 'Perfect for individual users getting started with basic credit needs.'),
      amount: t('addOns.packages.credits.small.amount', '100 credits'),
      price: 20,
      priceNote: t('addOns.packages.credits.small.priceNote', '$0.20 per credit'),
    },
    {
      id: 'medium',
      name: t('addOns.packages.credits.medium.name', 'Medium'),
      description: t('addOns.packages.credits.medium.description', 'Great for growing teams with moderate usage requirements.'),
      amount: t('addOns.packages.credits.medium.amount', '300 credits'),
      price: 50,
      priceNote: t('addOns.packages.credits.medium.priceNote', '$0.17 per credit'),
    },
    {
      id: 'large',
      name: t('addOns.packages.credits.large.name', 'Large'),
      description: t('addOns.packages.credits.large.description', 'Ideal for businesses with high-volume processing demands.'),
      amount: t('addOns.packages.credits.large.amount', '1,000 credits'),
      price: 150,
      priceNote: t('addOns.packages.credits.large.priceNote', '$0.15 per credit'),
    },
    {
      id: 'enterprise',
      name: t('addOns.packages.credits.enterprise.name', 'Enterprise'),
      description: t('addOns.packages.credits.enterprise.description', 'Tailored solutions for large organizations with unique needs.'),
      amount: t('addOns.packages.credits.enterprise.amount', 'Custom credits'),
      price: t('addOns.packages.credits.enterprise.price', 'Custom'),
      isEnterprise: true,
    },
  ];

  const CONNECTORS_DATA_TRANSLATED: AddOn[] = [
    {
      id: 'single',
      name: t('addOns.packages.connectors.single.name', 'Single Connector'),
      description: t('addOns.packages.connectors.single.description', 'Perfect for connecting one data source to your platform.'),
      amount: t('addOns.packages.connectors.single.amount', '1 connector'),
      price: 5,
      priceNote: 'per month',
    },
    {
      id: 'five',
      name: t('addOns.packages.connectors.five.name', '5 Connectors'),
      description: t('addOns.packages.connectors.five.description', 'Great for teams managing multiple data sources.'),
      amount: t('addOns.packages.connectors.five.amount', '5 connectors'),
      price: 25,
      priceNote: 'per month',
    },
    {
      id: 'ten',
      name: t('addOns.packages.connectors.ten.name', '10 Connectors'),
      description: t('addOns.packages.connectors.ten.description', 'Ideal for businesses with extensive integration needs.'),
      amount: t('addOns.packages.connectors.ten.amount', '10 connectors'),
      price: 50,
      priceNote: 'per month',
    },
    {
      id: 'all',
      name: t('addOns.packages.connectors.all.name', 'All Connectors'),
      description: t('addOns.packages.connectors.all.description', 'Unlimited access to all available connectors.'),
      amount: t('addOns.packages.connectors.all.amount', 'Unlimited connectors'),
      price: 500,
      priceNote: 'per month',
    },
  ];

  const STORAGE_DATA_TRANSLATED: AddOn[] = [
    {
      id: 'oneGb',
      name: t('addOns.packages.storage.oneGb.name', '1 GB Storage'),
      description: t('addOns.packages.storage.oneGb.description', 'Perfect for small projects with minimal storage needs.'),
      amount: t('addOns.packages.storage.oneGb.amount', '1 GB storage'),
      price: 30,
      priceNote: 'per month',
    },
    {
      id: 'fiveGb',
      name: t('addOns.packages.storage.fiveGb.name', '5 GB Storage'),
      description: t('addOns.packages.storage.fiveGb.description', 'Great for growing teams with moderate storage requirements.'),
      amount: t('addOns.packages.storage.fiveGb.amount', '5 GB storage'),
      price: 150,
      priceNote: 'per month',
    },
    {
      id: 'tenGb',
      name: t('addOns.packages.storage.tenGb.name', '10 GB Storage'),
      description: t('addOns.packages.storage.tenGb.description', 'Ideal for businesses with extensive data storage needs.'),
      amount: t('addOns.packages.storage.tenGb.amount', '10 GB storage'),
      price: 300,
      priceNote: 'per month',
    },
  ];
  
  const [quantities, setQuantities] = useState<Record<string, number>>(
    [...CREDITS_DATA_TRANSLATED, ...CONNECTORS_DATA_TRANSLATED, ...STORAGE_DATA_TRANSLATED].reduce(
      (acc, item) => ({ ...acc, [item.id]: 1 }),
      {}
    )
  );

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(1, prev[id] + delta),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">{t('addOns.title', 'Manage Add-ons')}</DialogTitle>
          <DialogDescription>
            {t('addOns.description', 'Review your current add-ons, adjust quantities, or explore more options to get the most out of your plan.')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="credits" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="ml-6 mt-6 w-fit rounded-full gap-2">
            <TabsTrigger 
              value="credits" 
              className="group flex items-center gap-2 bg-gray-100 text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-full"
            >
              <Coins size={16} className="text-blue-600 group-data-[state=active]:text-white" />
              <span>{t('addOns.credits', 'Credits')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="connectors" 
              className="group flex items-center gap-2 bg-gray-100 text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-full"
            >
              <Workflow size={16} className="text-blue-600 group-data-[state=active]:text-white" />
              <span>{t('addOns.connectors', 'Connectors')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="storage" 
              className="group flex items-center gap-2 bg-gray-100 text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-full"
            >
              <Server size={16} className="text-blue-600 group-data-[state=active]:text-white" />
              <span>{t('addOns.storage', 'Storage')}</span>
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto flex-1 p-6">
            <TabsContent value="credits" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CREDITS_DATA_TRANSLATED.map((credit) => (
                  <AddOnCard
                    key={credit.id}
                    addOn={credit}
                    icon={Coins}
                    quantity={quantities[credit.id]}
                    onQuantityChange={(delta) => handleQuantityChange(credit.id, delta)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="connectors" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {CONNECTORS_DATA_TRANSLATED.map((connector) => (
                  <AddOnCard
                    key={connector.id}
                    addOn={connector}
                    icon={Workflow}
                    quantity={quantities[connector.id]}
                    onQuantityChange={(delta) => handleQuantityChange(connector.id, delta)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="storage" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {STORAGE_DATA_TRANSLATED.map((storage) => (
                  <AddOnCard
                    key={storage.id}
                    addOn={storage}
                    icon={Server}
                    quantity={quantities[storage.id]}
                    onQuantityChange={(delta) => handleQuantityChange(storage.id, delta)}
                  />
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
