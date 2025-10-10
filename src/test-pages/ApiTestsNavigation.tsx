import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEstablishment } from '../hooks/useEstablishment';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Package, 
  Users, 
  CreditCard, 
  Building2, 
  FileText, 
  Shield,
  Code,
  TestTube,
  ArrowRight,
  Home
} from 'lucide-react';

interface ApiTestCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  status: 'ready' | 'in-progress' | 'planned';
  color: string;
}

export const ApiTestsNavigation: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { establishmentId, currentRole } = useEstablishment();

  const apiTests: ApiTestCard[] = [
    {
      title: 'Products API',
      description: 'Test product CRUD operations, search, and management',
      icon: <Package className="w-6 h-6" />,
      path: '/dev/api-tests/products',
      status: 'ready',
      color: 'bg-green-500'
    },
    {
      title: 'Customers API',
      description: 'Test customer creation, updates, and listing',
      icon: <Users className="w-6 h-6" />,
      path: '/dev/api-tests/customers',
      status: 'planned',
      color: 'bg-blue-500'
    },
    {
      title: 'Transactions API',
      description: 'Test transaction processing and management',
      icon: <CreditCard className="w-6 h-6" />,
      path: '/dev/api-tests/transactions',
      status: 'planned',
      color: 'bg-purple-500'
    },
    {
      title: 'Establishments API',
      description: 'Test establishment creation and management',
      icon: <Building2 className="w-6 h-6" />,
      path: '/dev/api-tests/establishments',
      status: 'planned',
      color: 'bg-orange-500'
    },
    {
      title: 'Documents API',
      description: 'Test document upload, management, and file handling',
      icon: <FileText className="w-6 h-6" />,
      path: '/dev/api-tests/documents',
      status: 'planned',
      color: 'bg-indigo-500'
    },
    {
      title: 'Authentication API',
      description: 'Test login, registration, and OAuth flows',
      icon: <Shield className="w-6 h-6" />,
      path: '/dev/api-tests/auth',
      status: 'planned',
      color: 'bg-red-500'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case 'in-progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'planned':
        return <Badge className="bg-gray-100 text-gray-800">Planned</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Back to App
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold flex items-center">
                <TestTube className="w-8 h-8 mr-3 text-blue-600" />
                BoostPay API Tests
              </h1>
              <p className="text-muted-foreground">Developer testing environment for FastAPI integration</p>
            </div>
          </div>
          <div className="text-right">
            <Code className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Development Mode</div>
          </div>
        </div>

        {/* Status Card */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Connection Status
              {isAuthenticated ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Connected
                </Badge>
              ) : (
                <Badge variant="destructive">Disconnected</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Authentication:</span>
                <div className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {isAuthenticated ? '✓ Authenticated' : '✗ Not authenticated'}
                </div>
              </div>
              <div>
                <span className="font-medium">Establishment:</span>
                <div className={establishmentId ? 'text-green-600' : 'text-orange-600'}>
                  {establishmentId ? `ID: ${establishmentId}` : 'Not selected'}
                </div>
              </div>
              <div>
                <span className="font-medium">Role:</span>
                <div className={currentRole ? 'text-blue-600' : 'text-gray-600'}>
                  {currentRole || 'N/A'}
                </div>
              </div>
            </div>
            {!isAuthenticated && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ You need to authenticate first. Visit any test page to set up your API token.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apiTests.map((test, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow duration-200 group"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${test.color} bg-opacity-10`}>
                    <div className={`${test.color.replace('bg-', 'text-')}`}>
                      {test.icon}
                    </div>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
                <CardTitle className="text-lg">{test.title}</CardTitle>
                <CardDescription className="text-sm">
                  {test.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {test.status === 'ready' ? (
                  <Link to={test.path}>
                    <Button className="w-full group-hover:bg-primary/90">
                      Test API
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button disabled className="w-full">
                    {test.status === 'in-progress' ? 'In Development' : 'Coming Soon'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Info */}
        <Card className="bg-slate-50 dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-lg">Quick Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">How to use:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Click on any "Ready" API test card</li>
                  <li>• Authenticate with your JWT token</li>
                  <li>• Test CRUD operations and features</li>
                  <li>• View real API responses and errors</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Features:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Real-time API testing</li>
                  <li>• Automatic establishment management</li>
                  <li>• Error handling and validation</li>
                  <li>• React Query caching and state</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-6">
          <p>🚀 BoostPay Developer Testing Environment</p>
          <p className="mt-1">This page is hidden from production and only accessible via direct URL</p>
        </div>
      </div>
    </div>
  );
};