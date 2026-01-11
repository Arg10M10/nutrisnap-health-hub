package com.calorelapp.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import com.calorelapp.app.R; // Explicit import
import org.json.JSONObject;

public class WaterWidget extends AppWidgetProvider {

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        String jsonStr = prefs.getString("WIDGET_DATA", "{}");
        
        int water = 0;
        try {
            if (jsonStr != null && !jsonStr.equals("{}")) {
                JSONObject data = new JSONObject(jsonStr);
                water = data.optInt("water", 0);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.water_widget);
        views.setTextViewText(R.id.water_count, String.valueOf(water));

        // Click opens app
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.water_count, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
}