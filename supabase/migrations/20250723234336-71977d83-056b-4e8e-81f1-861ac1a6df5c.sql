
-- Fix the get_dashboard_stats function to resolve ambiguous column references
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_uuid UUID)
RETURNS TABLE (
    total_methods INTEGER,
    total_columns INTEGER,
    total_metabolites INTEGER,
    active_columns INTEGER,
    total_injections BIGINT,
    avg_column_usage DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::INTEGER FROM public.methods WHERE methods.user_id = user_uuid),
        (SELECT COUNT(*)::INTEGER FROM public.columns WHERE columns.user_id = user_uuid),
        (SELECT COUNT(*)::INTEGER FROM public.metabolites WHERE metabolites.user_id = user_uuid),
        (SELECT COUNT(*)::INTEGER FROM public.columns WHERE columns.user_id = user_uuid AND columns.status = 'active'),
        (SELECT COUNT(*) FROM public.injections WHERE injections.user_id = user_uuid),
        (SELECT COALESCE(AVG(columns.total_injections::DECIMAL / NULLIF(columns.estimated_lifetime_injections::DECIMAL, 0) * 100), 0)
         FROM public.columns WHERE columns.user_id = user_uuid AND columns.status = 'active');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
