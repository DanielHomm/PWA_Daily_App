'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'admin';
}

import { cookies } from 'next/headers';

export async function createGoal(formData) {
    console.log('Running createGoal with detailed auth checks');
    const cookieStore = await cookies();
    console.log('Cookies received:', cookieStore.getAll().map(c => c.name));

    const supabase = await createClient();

    // 1. Check User
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        console.error('Auth Error:', userError);
        return { error: `Unauthorized: User check failed. ${userError?.message || 'No user found'}` };
    }

    // 2. Check Profile Role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Profile Error:', profileError);
        return { error: `Unauthorized: Could not fetch profile. ${profileError.message}` };
    }

    if (profile?.role !== 'admin') {
        return { error: `Unauthorized: Role is '${profile?.role}', expected 'admin'.` };
    }

    const title = formData.get('title');
    const description = formData.get('description');
    const target_value = formData.get('target_value');
    const target_unit = formData.get('target_unit');
    const frequency = formData.get('frequency');
    const type = formData.get('type');
    const show_daily_sum = formData.get('show_daily_sum') === 'on';
    const show_weekly_sum = formData.get('show_weekly_sum') === 'on';
    const show_monthly_sum = formData.get('show_monthly_sum') === 'on';

    // User is already verified


    const { error } = await supabase
        .from('goals')
        .insert({
            user_id: user.id,
            title,
            description,
            target_value,
            target_unit,
            frequency,
            type,
            show_daily_sum,
            show_weekly_sum,
            show_monthly_sum
        });

    if (error) {
        console.error('Error creating goal:', error);
        return { error: 'Failed to create goal' };
    }

    revalidatePath('/admin/goals');
    return { success: true };
}

export async function getGoals() {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching goals:', error);
        return [];
    }

    return data;
}

export async function getGoal(id) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching goal:', error);
        return null;
    }

    return data;
}

export async function deleteGoal(id) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: 'Unauthorized' };

    const supabase = await createClient();
    const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting goal:', error);
        return { error: 'Failed to delete goal' };
    }

    revalidatePath('/admin/goals');
    return { success: true };
}

export async function logGoalProgress(goalId, formData) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: 'Unauthorized' };

    const supabase = await createClient();
    const value = formData.get('value');
    const notes = formData.get('notes');
    const log_date = formData.get('log_date') || new Date().toISOString().split('T')[0];

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('goal_logs')
        .insert({
            goal_id: goalId,
            user_id: user.id,
            value,
            notes,
            log_date
        });

    if (error) {
        console.error('Error logging progress:', error);
        return { error: 'Failed to log progress' };
    }

    revalidatePath(`/admin/goals/${goalId}`);
    return { success: true };
}

export async function getGoalLogs(goalId) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('goal_logs')
        .select('*')
        .eq('goal_id', goalId)
        .order('log_date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching logs:', error);
        return [];
    }

    return data;
}

export async function deleteGoalLog(logId) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return { error: 'Unauthorized' };

    const supabase = await createClient();

    // Get goal_id for revalidation before deletion
    const { data: log } = await supabase
        .from('goal_logs')
        .select('goal_id')
        .eq('id', logId)
        .single();

    const { error } = await supabase
        .from('goal_logs')
        .delete()
        .eq('id', logId);

    if (error) {
        console.error('Error deleting log:', error);
        return { error: 'Failed to delete log' };
    }

    if (log) {
        revalidatePath(`/admin/goals/${log.goal_id}`);
    }
    return { success: true };
}
