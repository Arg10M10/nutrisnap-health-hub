import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useDebouncedCallback } from 'use-debounce';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, PlusCircle, Heart, Loader2, Search, Trash2 } from 'lucide-react';
import NewFeatureRequestDrawer from '@/components/settings/NewFeatureRequestDrawer';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FeatureRequest {
  id: string;
  created_at: string;
  title: string;
  description: string;
  votes: number;
  user_id: string | null;
}

const RequestFeature = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: requests = [], isLoading: isLoadingRequests } = useQuery<FeatureRequest[]>({
    queryKey: ['feature_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_requests')
        .select('*')
        .order('votes', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: userVotes = [] } = useQuery<string[]>({
    queryKey: ['user_votes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('feature_request_votes')
        .select('request_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map(v => v.request_id);
    },
    enabled: !!user,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'increment' | 'decrement' }) => {
      const { error } = await supabase.rpc(action === 'increment' ? 'increment_vote' : 'decrement_vote', {
        request_id_arg: requestId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature_requests'] });
      queryClient.invalidateQueries({ queryKey: ['user_votes', user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.from('feature_requests').delete().eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature_requests'] });
      toast.success(t('request_feature.delete_toast_success'));
    },
    onError: (error) => {
      toast.error(t('request_feature.delete_toast_error'), { description: error.message });
    },
  });

  const handleVote = (requestId: string) => {
    const hasVoted = userVotes.includes(requestId);
    voteMutation.mutate({ requestId, action: hasVoted ? 'decrement' : 'increment' });
  };

  const debouncedSearch = useDebouncedCallback((value) => {
    setSearchTerm(value);
  }, 300);

  const filteredRequests = useMemo(() => {
    if (!searchTerm) return requests;
    return requests.filter(
      (req) =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [requests, searchTerm]);

  return (
    <PageLayout>
      <div className="space-y-8">
        <header className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">{t('request_feature.title')}</h1>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>{t('request_feature.subtitle')}</CardTitle>
            <CardDescription>{t('request_feature.description')}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t('request_feature.search_placeholder')}
                className="pl-10 h-12"
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>
            <Button size="lg" className="h-12" onClick={() => setIsDrawerOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              {t('request_feature.create_button')}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoadingRequests ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            filteredRequests.map((req) => {
              const hasVoted = userVotes.includes(req.id);
              const isOwner = user?.id === req.user_id;

              return (
                <Card key={req.id}>
                  <CardContent className="p-6 flex items-start gap-4">
                    <Button
                      variant="outline"
                      className={cn(
                        "flex flex-col h-auto p-2 gap-0.5 w-16 transition-colors",
                        hasVoted && "border-primary text-primary bg-primary/10"
                      )}
                      onClick={() => handleVote(req.id)}
                      disabled={voteMutation.isPending}
                    >
                      <Heart className={cn("w-6 h-6", hasVoted && "fill-current")} />
                      <span className="font-bold text-lg">{req.votes}</span>
                    </Button>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-lg text-foreground break-words">{req.title}</h3>
                        {isOwner && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 -mt-1 -mr-2">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar solicitud?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará la solicitud y todos sus votos.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteMutation.mutate(req.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                      <p className="text-muted-foreground break-words">{req.description}</p>
                      <p className="text-xs text-muted-foreground/80 mt-2">
                        {formatDistanceToNow(new Date(req.created_at), {
                          addSuffix: true,
                          locale: i18n.language === 'es' ? es : undefined,
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
      <NewFeatureRequestDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </PageLayout>
  );
};

export default RequestFeature;