import { supabase } from "@/integrations/supabase/client";
import { AccountRequest, CreateAccountRequest } from "@/types/accountRequest";

export const createAccountRequest = async (request: CreateAccountRequest): Promise<AccountRequest> => {
  try {
    const { data, error } = await supabase
      .from('account_requests')
      .insert([{
        name: request.name,
        email: request.email,
        role: request.role || 'viewer'
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar solicitação: ${error.message}`);
    }

    return data as AccountRequest;
  } catch (error) {
    console.error('Error creating account request:', error);
    throw error;
  }
};

export const getAccountRequests = async (): Promise<AccountRequest[]> => {
  try {
    const { data, error } = await supabase
      .from('account_requests')
      .select('*')
      .order('requested_at', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar solicitações: ${error.message}`);
    }

    return (data || []) as AccountRequest[];
  } catch (error) {
    console.error('Error fetching account requests:', error);
    throw error;
  }
};

export const approveAccountRequest = async (
  requestId: string, 
  role: 'admin' | 'mensalista' | 'viewer'
): Promise<boolean> => {
  try {
    // Get current user (admin)
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    // Get the request
    const { data: request, error: fetchError } = await supabase
      .from('account_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (fetchError || !request) {
      throw new Error('Solicitação não encontrada');
    }

    // Update request status to approved
    const { error: updateError } = await supabase
      .from('account_requests')
      .update({
        status: 'approved',
        approved_by: currentUser.id,
        approved_at: new Date().toISOString(),
        role: role
      })
      .eq('id', requestId);

    if (updateError) {
      throw new Error(`Erro ao atualizar solicitação: ${updateError.message}`);
    }

    // Note: The user will be created when they first sign in with their email
    // The trigger will automatically create their profile with the approved role
    
    return true;
  } catch (error) {
    console.error('Error approving account request:', error);
    throw error;
  }
};

export const denyAccountRequest = async (requestId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('account_requests')
      .update({
        status: 'denied',
        approved_by: (await supabase.auth.getUser()).data.user?.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', requestId);

    if (error) {
      throw new Error(`Erro ao negar solicitação: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error denying account request:', error);
    throw error;
  }
};