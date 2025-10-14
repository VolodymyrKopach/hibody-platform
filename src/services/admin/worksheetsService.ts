/**
 * Admin Worksheets Service
 * Service for managing worksheets in admin panel
 */

import { createClient } from '@/lib/supabase/client';
import type {
  WorksheetListItem,
  WorksheetDetail,
  WorksheetFilters,
  WorksheetStats,
  PaginatedResponse,
  AdminApiResponse,
} from '@/types/admin';

class WorksheetsService {
  /**
   * Get paginated list of worksheets with filters
   */
  async getWorksheets(
    filters: WorksheetFilters = {}
  ): Promise<PaginatedResponse<WorksheetListItem>> {
    const supabase = createClient();

    const {
      search,
      user_id,
      lesson_id,
      type,
      age_group,
      date_from,
      date_to,
      sort_by = 'created_at',
      sort_order = 'desc',
      limit = 20,
      offset = 0,
    } = filters;

    let query = supabase
      .from('worksheets')
      .select(
        `
        *,
        user_profiles!inner(email, full_name),
        lessons(title),
        worksheet_downloads(count)
        `,
        { count: 'exact' }
      );

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (lesson_id) {
      query = query.eq('lesson_id', lesson_id);
    }

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (age_group) {
      query = query.eq('age_group', age_group);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    // Sorting
    query = query.order(sort_by, { ascending: sort_order === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching worksheets:', error);
      throw new Error('Failed to fetch worksheets');
    }

    const worksheets: WorksheetListItem[] = (data || []).map((worksheet: any) => ({
      id: worksheet.id,
      lesson_id: worksheet.lesson_id,
      user_id: worksheet.user_id,
      title: worksheet.title,
      type: worksheet.type,
      age_group: worksheet.age_group,
      thumbnail_url: worksheet.thumbnail_url,
      file_url: worksheet.file_url,
      file_size: worksheet.file_size || 0,
      created_at: worksheet.created_at,
      updated_at: worksheet.updated_at,
      user_email: worksheet.user_profiles?.email,
      user_full_name: worksheet.user_profiles?.full_name,
      lesson_title: worksheet.lessons?.title,
      downloads_count: Array.isArray(worksheet.worksheet_downloads)
        ? worksheet.worksheet_downloads.length
        : worksheet.worksheet_downloads?.[0]?.count || 0,
    }));

    return {
      data: worksheets,
      total: count || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };
  }

  /**
   * Get detailed worksheet information
   */
  async getWorksheetDetail(worksheetId: string): Promise<WorksheetDetail> {
    const supabase = createClient();

    const { data: worksheet, error } = await supabase
      .from('worksheets')
      .select(
        `
        *,
        user_profiles!inner(email, full_name),
        lessons(title),
        worksheet_downloads(count)
        `
      )
      .eq('id', worksheetId)
      .single();

    if (error || !worksheet) {
      console.error('Error fetching worksheet detail:', error);
      throw new Error('Failed to fetch worksheet detail');
    }

    return {
      id: worksheet.id,
      lesson_id: worksheet.lesson_id,
      user_id: worksheet.user_id,
      title: worksheet.title,
      description: worksheet.description,
      type: worksheet.type,
      age_group: worksheet.age_group,
      thumbnail_url: worksheet.thumbnail_url,
      file_url: worksheet.file_url,
      file_size: worksheet.file_size || 0,
      metadata: worksheet.metadata || {},
      created_at: worksheet.created_at,
      updated_at: worksheet.updated_at,
      user_email: worksheet.user_profiles?.email,
      user_full_name: worksheet.user_profiles?.full_name,
      lesson_title: worksheet.lessons?.title,
      downloads_count: Array.isArray(worksheet.worksheet_downloads)
        ? worksheet.worksheet_downloads.length
        : worksheet.worksheet_downloads?.[0]?.count || 0,
      total_downloads: Array.isArray(worksheet.worksheet_downloads)
        ? worksheet.worksheet_downloads.length
        : worksheet.worksheet_downloads?.[0]?.count || 0,
      views_count: 0, // TODO: Implement views tracking
    };
  }

  /**
   * Delete worksheet
   */
  async deleteWorksheet(worksheetId: string): Promise<AdminApiResponse> {
    const supabase = createClient();

    const { error } = await supabase.from('worksheets').delete().eq('id', worksheetId);

    if (error) {
      console.error('Error deleting worksheet:', error);
      return {
        success: false,
        error: 'Failed to delete worksheet',
      };
    }

    return {
      success: true,
      message: 'Worksheet deleted successfully',
    };
  }

  /**
   * Bulk delete worksheets
   */
  async bulkDeleteWorksheets(worksheetIds: string[]): Promise<AdminApiResponse> {
    const supabase = createClient();

    const { error } = await supabase.from('worksheets').delete().in('id', worksheetIds);

    if (error) {
      console.error('Error bulk deleting worksheets:', error);
      return {
        success: false,
        error: 'Failed to delete worksheets',
      };
    }

    return {
      success: true,
      message: `${worksheetIds.length} worksheets deleted successfully`,
    };
  }

  /**
   * Get worksheets statistics
   */
  async getWorksheetsStats(): Promise<WorksheetStats> {
    const supabase = createClient();

    // Get total count
    const { count: totalCount } = await supabase
      .from('worksheets')
      .select('*', { count: 'exact', head: true });

    // Get by type
    const { data: worksheets } = await supabase.from('worksheets').select('type, age_group');

    const typeCounts = (worksheets || []).reduce((acc: any, ws: any) => {
      acc[ws.type] = (acc[ws.type] || 0) + 1;
      return acc;
    }, {});

    const ageCounts = (worksheets || []).reduce((acc: any, ws: any) => {
      acc[ws.age_group] = (acc[ws.age_group] || 0) + 1;
      return acc;
    }, {});

    // Get total downloads
    const { count: downloadsCount } = await supabase
      .from('worksheet_downloads')
      .select('*', { count: 'exact', head: true });

    // Get most downloaded
    const { data: mostDownloaded } = await supabase
      .from('worksheets')
      .select(
        `
        *,
        user_profiles(email, full_name),
        worksheet_downloads(count)
        `
      )
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      total_worksheets: totalCount || 0,
      by_type: Object.entries(typeCounts).map(([type, count]) => ({ type, count: count as number })),
      by_age_group: Object.entries(ageCounts).map(([age_group, count]) => ({
        age_group,
        count: count as number,
      })),
      total_downloads: downloadsCount || 0,
      most_downloaded:
        mostDownloaded?.map((ws: any) => ({
          id: ws.id,
          lesson_id: ws.lesson_id,
          user_id: ws.user_id,
          title: ws.title,
          type: ws.type,
          age_group: ws.age_group,
          thumbnail_url: ws.thumbnail_url,
          file_url: ws.file_url,
          file_size: ws.file_size || 0,
          created_at: ws.created_at,
          updated_at: ws.updated_at,
          user_email: ws.user_profiles?.email,
          user_full_name: ws.user_profiles?.full_name,
          downloads_count: Array.isArray(ws.worksheet_downloads)
            ? ws.worksheet_downloads.length
            : 0,
        })) || [],
    };
  }

  /**
   * Export worksheets to CSV
   */
  async exportWorksheetsToCSV(filters: WorksheetFilters = {}): Promise<string> {
    const { data: worksheets } = await this.getWorksheets({ ...filters, limit: 10000, offset: 0 });

    const headers = [
      'ID',
      'Title',
      'Type',
      'Age Group',
      'File Size (KB)',
      'Downloads',
      'Author Email',
      'Author Name',
      'Created At',
    ];

    const rows = worksheets.map((worksheet) => [
      worksheet.id,
      worksheet.title,
      worksheet.type,
      worksheet.age_group,
      (worksheet.file_size / 1024).toFixed(2),
      worksheet.downloads_count || 0,
      worksheet.user_email || '',
      worksheet.user_full_name || '',
      new Date(worksheet.created_at).toLocaleDateString(),
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    return csvContent;
  }
}

export const worksheetsService = new WorksheetsService();

