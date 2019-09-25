<?php

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
 */

Route::group(['prefix' => 'v1'], function () {
    Route::post('login', 'UsersController@login')->name('login');
    Route::post('register', 'UsersController@signup')->name('register');
    Route::get('verify/{token}', 'UsersController@verify')->name('verify');
    Route::get('users', 'UsersController@all')->name('users');
    Route::get('users/{id}', 'UsersController@find')->name('users');

    Route::group(['middleware' => 'auth:api'], function () {

    });

});