package com.calorelapp.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import org.json.JSONObject;

public class CalorelWidget extends AppWidgetProvider {

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        // Read data from Capacitor Preferences
        // Capacitor uses a specific file named "CapacitorStorage" for Preferences plugin
        SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
        
        // The key we used in React is 'WIDGET_DATA'
        String jsonStr = prefs.getString("WIDGET_DATA", "{}");
        
        int calories = 0;
        int goal = 2000;
        int streak = 0;

        try {
            JSONObject data = new JSONObject(jsonStr);
            calories = data.optInt("calories", 0);
            goal = data.optInt("caloriesGoal", 2000);
            streak = data.optInt("streak", 0);
        } catch (Exception e) {
            e.printStackTrace();
        }

        // Construct the RemoteViews object
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.calorel_widget);
        
        // Update UI
        views.setTextViewText(R.id.calories_text, calories + " kcal");
        views.setTextViewText(R.id.calories_goal_text, "/ " + goal);
        views.setTextViewText(R.id.streak_text, String.valueOf(streak));
        
        int progress = 0;
        if (goal > 0) {
            progress = Math.min((int)(((float)calories / goal) * 100), 100);
        }
        views.setProgressBar(R.id.calories_progress, 100, progress, false);

        // Click on widget opens the app
        Intent intent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.app_title, pendingIntent);
        views.setOnClickPendingIntent(R.id.calories_text, pendingIntent);

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }
}