'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addCommonItem(formData) {
    const supabase = await createClient();

    // 1. Check Auth & Admin Status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: 'Unauthorized' };
    }

    // Check profile role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: 'Forbidden: Admins only' };
    }

    // 2. Extract Data
    const name = formData.get('name');
    const name_de = formData.get('name_de');
    const category_name = formData.get('category');
    const default_unit = formData.get('default_unit') || 'units';
    const icon = formData.get('icon') || '📦';

    if (!name || !category_name) {
        return { error: 'Name and Category are required' };
    }

    // 3. Insert into common_items
    const { error: insertError } = await supabase
        .from('common_items')
        .insert({
            name,
            name_de,
            category_name,
            default_unit,
            icon
        });

    if (insertError) {
        console.error('Error adding common item:', insertError);
        if (insertError.code === '23505') { // Unique violation
            return { error: 'Item with this name already exists' };
        }
        return { error: 'Failed to add item' };
    }

    revalidatePath('/admin/common-items');
    return { success: true };
}
